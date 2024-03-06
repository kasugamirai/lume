use crate::Nostr;
use keyring::Entry;
use nostr_sdk::prelude::*;
use std::io::{BufReader, Read};
use std::iter;
use std::time::Duration;
use std::{fs::File, io::Write, str::FromStr};
use tauri::{Manager, State};

#[derive(serde::Serialize)]
pub struct CreateKeysResponse {
  npub: String,
  nsec: String,
}

#[tauri::command]
pub fn create_keys() -> Result<CreateKeysResponse, ()> {
  let keys = Keys::generate();
  let public_key = keys.public_key();
  let secret_key = keys.secret_key().expect("secret key failed");

  let result = CreateKeysResponse {
    npub: public_key.to_bech32().expect("npub failed"),
    nsec: secret_key.to_bech32().expect("nsec failed"),
  };

  Ok(result.into())
}

#[tauri::command]
pub async fn save_key(
  nsec: &str,
  password: &str,
  app_handle: tauri::AppHandle,
  state: State<'_, Nostr>,
) -> Result<bool, String> {
  let secret_key: Result<SecretKey, String>;

  if nsec.starts_with("ncrypto") {
    let encrypted_key = EncryptedSecretKey::from_bech32(nsec).unwrap();
    secret_key = match encrypted_key.to_secret_key(password) {
      Ok(val) => Ok(val),
      Err(_) => Err("Wrong passphase".into()),
    };
  } else {
    secret_key = match SecretKey::from_bech32(nsec) {
      Ok(val) => Ok(val),
      Err(_) => Err("nsec is not valid".into()),
    }
  }

  match secret_key {
    Ok(val) => {
      let nostr_keys = Keys::new(val);
      let nostr_npub = nostr_keys.public_key().to_bech32().unwrap();
      let signer = NostrSigner::Keys(nostr_keys);

      // Update client's signer
      let client = &state.client;
      client.set_signer(Some(signer)).await;

      let keyring_entry = Entry::new("Lume Secret Storage", "AppKey").unwrap();
      let master_key = keyring_entry.get_password().unwrap();
      let app_key = age::x25519::Identity::from_str(&master_key).unwrap();
      let app_pubkey = app_key.to_public();

      let config_dir = app_handle.path().app_config_dir().unwrap();
      let encryptor = age::Encryptor::with_recipients(vec![Box::new(app_pubkey)])
        .expect("we provided a recipient");

      let file_path = nostr_npub + ".nsec";
      let mut file = File::create(config_dir.join(file_path)).unwrap();
      let mut writer = encryptor
        .wrap_output(&mut file)
        .expect("Init writer failed");
      writer
        .write_all(nsec.as_bytes())
        .expect("Write nsec failed");
      writer.finish().expect("Save nsec failed");

      Ok(true)
    }
    Err(msg) => Err(msg.into()),
  }
}

#[tauri::command]
pub async fn update_signer(nsec: &str, state: State<'_, Nostr>) -> Result<(), ()> {
  let client = &state.client;
  let secret_key = SecretKey::from_bech32(nsec).unwrap();
  let keys = Keys::new(secret_key);
  let signer = NostrSigner::Keys(keys);

  client.set_signer(Some(signer)).await;

  Ok(())
}

#[tauri::command]
pub async fn verify_signer(state: State<'_, Nostr>) -> Result<bool, ()> {
  let client = &state.client;

  if let Ok(_) = client.signer().await {
    Ok(true)
  } else {
    Ok(false)
  }
}

#[tauri::command]
pub async fn load_selected_account(
  npub: &str,
  app_handle: tauri::AppHandle,
  state: State<'_, Nostr>,
) -> Result<bool, String> {
  let client = &state.client;
  let config_dir = app_handle.path().app_config_dir().unwrap();
  let keyring_entry = Entry::new("Lume Secret Storage", "AppKey").unwrap();

  // Get master password
  if let Ok(key) = keyring_entry.get_password() {
    // Build master key
    let app_key = age::x25519::Identity::from_str(&key.to_string()).unwrap();

    // Open nsec file
    if let Ok(file) = File::open(config_dir.join(npub)) {
      let file_buf = BufReader::new(file);
      let decryptor = match age::Decryptor::new_buffered(file_buf).expect("Decryptor failed") {
        age::Decryptor::Recipients(d) => d,
        _ => unreachable!(),
      };

      let mut decrypted = vec![];
      let mut reader = decryptor
        .decrypt(iter::once(&app_key as &dyn age::Identity))
        .expect("Decrypt nsec file failed");
      reader
        .read_to_end(&mut decrypted)
        .expect("Read secret key failed");

      // Get decrypted nsec key
      let nsec_key = String::from_utf8(decrypted).unwrap();

      // Build nostr signer
      let secret_key = SecretKey::from_bech32(nsec_key).expect("Get secret key failed");
      let keys = Keys::new(secret_key);
      let public_key = keys.public_key();
      let signer = NostrSigner::Keys(keys);

      // Update signer
      client.set_signer(Some(signer)).await;

      // Get user's relay list
      let filter = Filter::new()
        .author(public_key)
        .kind(Kind::RelayList)
        .limit(1);
      let query = client
        .get_events_of(vec![filter], Some(Duration::from_secs(10)))
        .await;

      // Connect user's relay list
      if let Ok(events) = query {
        if let Some(event) = events.first() {
          let list = nip65::extract_relay_list(&event);
          for item in list.into_iter() {
            client
              .connect_relay(item.0.to_string())
              .await
              .unwrap_or_default();
          }
        }
      }

      Ok(true)
    } else {
      Ok(false)
    }
  } else {
    Err("App Key not found".into())
  }
}

#[tauri::command]
pub fn event_to_bech32(id: &str, relays: Vec<String>) -> Result<String, ()> {
  let event_id = EventId::from_hex(id).unwrap();
  let event = Nip19Event::new(event_id, relays);

  Ok(event.to_bech32().unwrap())
}

#[tauri::command]
pub fn user_to_bech32(key: &str, relays: Vec<String>) -> Result<String, ()> {
  let pubkey = PublicKey::from_str(key).unwrap();
  let profile = Nip19Profile::new(pubkey, relays);

  Ok(profile.to_bech32().unwrap())
}

#[tauri::command(async)]
pub async fn verify_nip05(key: &str, nip05: &str) -> Result<bool, ()> {
  let public_key = PublicKey::from_str(key).unwrap();
  let status = nip05::verify(public_key, nip05, None).await;

  if let Ok(_) = status {
    Ok(true)
  } else {
    Ok(false)
  }
}
