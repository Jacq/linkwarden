import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Link as LinkType, Tag } from "@prisma/client";
import isValidUrl from "@/lib/shared/isValidUrl";
import unescapeString from "@/lib/client/unescapeString";
import { TagIncludingLinkCount } from "@/types/global";
import Link from "next/link";

interface LinksIncludingTags extends LinkType {
  tags: TagIncludingLinkCount[];
}

type Props = {
  link: LinksIncludingTags;
  count: number;
};

export default function LinkCard({ link, count }: Props) {
  const url = link.url && isValidUrl(link.url) ? new URL(link.url) : undefined;

  const formattedDate = new Date(
    link.createdAt as unknown as string
  ).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border border-solid border-neutral-content bg-base-200 shadow hover:shadow-none duration-100 rounded-lg p-3 flex items-start relative gap-3 group/item">
      <div className="flex justify-between items-end gap-5 w-full h-full z-0">
        <div className="flex flex-col justify-between w-full">
          <div className="flex items-center gap-2">
            <p className="text-2xl">
              {url && (
                <Image
                  src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url.origin}&size=32`}
                  width={30}
                  height={30}
                  alt=""
                  className="select-none z-10 rounded-md shadow border-[1px] border-white bg-white float-left mr-2"
                  draggable="false"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = "none";
                  }}
                />
              )}
              {unescapeString(link.name || link.description)}
            </p>
          </div>

          <div className="flex gap-3 items-center flex-wrap my-2">
            <div className="flex gap-1 items-center flex-wrap">
              {link.tags.map((e, i) => (
                <Link
                  href={"/public/collections/20?q=" + e.name}
                  key={i}
                  className="btn btn-xs btn-ghost truncate max-w-[19rem]"
                >
                  #{e.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-1 items-center flex-wrap text-sm text-neutral">
            <p>{formattedDate}</p>
            <p>·</p>
            <Link
              href={url ? url.href : link.url || ""}
              target="_blank"
              className="hover:opacity-50 duration-100 truncate w-52 sm:w-fit"
              title={url ? url.href : link.url || ""}
            >
              {url ? url.host : link.url}
            </Link>
          </div>
          <div className="w-full">
            {unescapeString(link.description)}{" "}
            <Link
              href={`/public/links/${link.id}`}
              className="flex gap-1 items-center flex-wrap text-sm text-neutral hover:opacity-50 duration-100 min-w-fit float-right mt-1 ml-2"
            >
              <p>Read</p>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="w-3 h-3 mt-[0.15rem]"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
