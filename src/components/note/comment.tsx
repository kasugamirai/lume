import NoteMetadata from '@components/note/metadata';
import { ImagePreview } from '@components/note/preview/image';
import { VideoPreview } from '@components/note/preview/video';
import { NoteRepost } from '@components/note/repost';
import { UserExtend } from '@components/user/extend';
import { UserMention } from '@components/user/mention';

import destr from 'destr';
import { memo, useMemo } from 'react';
import reactStringReplace from 'react-string-replace';

export const NoteComment = memo(function NoteComment({ event }: { event: any }) {
  const content = useMemo(() => {
    let parsedContent = event.content;
    // get data tags
    const tags = destr(event.tags);
    // handle urls
    parsedContent = reactStringReplace(parsedContent, /(https?:\/\/\S+)/g, (match, i) => {
      if (match.match(/\.(jpg|jpeg|gif|png|webp)$/i)) {
        // image url
        return <ImagePreview key={match + i} url={match} />;
      } else if (match.match(/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)) {
        // youtube
        return <VideoPreview key={match + i} url={match} />;
      } else if (match.match(/\.(mp4|webm)$/i)) {
        // video
        return <VideoPreview key={match + i} url={match} />;
      } else {
        return (
          <a key={match + i} href={match} target="_blank" rel="noreferrer">
            {match}
          </a>
        );
      }
    });
    // handle #-hashtags
    parsedContent = reactStringReplace(parsedContent, /#(\w+)/g, (match, i) => (
      <span key={match + i} className="cursor-pointer text-fuchsia-500">
        #{match}
      </span>
    ));
    // handle mentions
    if (tags.length > 0) {
      parsedContent = reactStringReplace(parsedContent, /\#\[(\d+)\]/gm, (match, i) => {
        if (tags[match][0] === 'p') {
          // @-mentions
          return <UserMention key={match + i} pubkey={tags[match][1]} />;
        } else if (tags[match][0] === 'e') {
          // note-mentions
          return <NoteRepost key={match + i} id={tags[match][1]} />;
        } else {
          return;
        }
      });
    }

    return parsedContent;
  }, [event.content, event.tags]);

  return (
    <div className="relative z-10 flex h-min min-h-min w-full select-text flex-col border-b border-zinc-800 px-3 py-5 hover:bg-black/20">
      <div className="relative z-10 flex flex-col">
        <UserExtend pubkey={event.pubkey} time={event.createdAt || event.created_at} />
        <div className="-mt-5 pl-[52px]">
          <div className="flex flex-col gap-2">
            <div className="prose prose-zinc max-w-none break-words text-[15px] leading-tight dark:prose-invert prose-p:m-0 prose-p:text-[15px] prose-p:leading-tight prose-a:font-normal prose-a:text-fuchsia-500 prose-a:no-underline prose-img:m-0 prose-video:m-0">
              {content}
            </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="mt-5 pl-[52px]">
          <NoteMetadata
            eventID={event.eventId}
            eventPubkey={event.pubkey}
            eventContent={event.content}
            eventTime={event.createdAt || event.created_at}
          />
        </div>
      </div>
    </div>
  );
});