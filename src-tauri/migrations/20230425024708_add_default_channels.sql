-- Add migration script here
INSERT
OR IGNORE INTO channels (event_id, pubkey, metadata, created_at)
VALUES
  (
    "e3cadf5beca1b2af1cddaa41a633679bedf263e3de1eb229c6686c50d85df753",
    "126103bfddc8df256b6e0abfd7f3797c80dcc4ea88f7c2f87dd4104220b4d65f",
    '{"name":"lume-general","picture":"https://void.cat/d/UNyxBmAh1MUx5gQTX95jyf.webp","about":"General channel for Lume"}',
    1681898574
  );

INSERT
OR IGNORE INTO channels (event_id, pubkey, metadata, created_at)
VALUES
  (
    "1abf8948d2fd05dd1836b33b324dca65138b2e80c77b27eeeed4323246efba4d",
    "126103bfddc8df256b6e0abfd7f3797c80dcc4ea88f7c2f87dd4104220b4d65f",
    '{"picture":"https://void.cat/d/MsqUKXXC4SxDfmT2KiHovJ.webp","name":"Arcade Open R&D","about":""}',
    1682252461
  );

INSERT
OR IGNORE INTO channels (event_id, pubkey, metadata, created_at)
VALUES
  (
    "42224859763652914db53052103f0b744df79dfc4efef7e950fc0802fc3df3c5",
    "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c",
    '{"about":"General discussion about the Amethyst Nostr client for Android","name":"Amethyst Users","picture":"https://nostr.build/i/5970.png"}',
    1674092111
  );

INSERT
OR IGNORE INTO channels (event_id, pubkey, metadata, created_at)
VALUES
  (
    "25e5c82273a271cb1a840d0060391a0bf4965cafeb029d5ab55350b418953fbb",
    "ed1d0e1f743a7d19aa2dfb0162df73bacdbc699f67cc55bb91a98c35f7deac69",
    '{"about":"","name":"Nostr","picture":"https://cloudflare-ipfs.com/ipfs/QmTN4Eas9atUULVbEAbUU8cowhtvK7g3t7jfKztY7wc8eP?.png"}',
    1661333723
  );