import LinkLayout from "@/layouts/LinkLayout";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import useLinkStore from "@/store/links";
import { useRouter } from "next/router";
import {
  ArchivedFormat,
  LinkIncludingShortenedCollectionAndTags,
} from "@/types/global";
import Image from "next/image";
import ColorThief, { RGBColor } from "colorthief";
import unescapeString from "@/lib/client/unescapeString";
import isValidUrl from "@/lib/shared/isValidUrl";
import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faFolder,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import useModalStore from "@/store/modals";
import { useSession } from "next-auth/react";
import useLocalSettingsStore from "@/store/localSettings";

type LinkContent = {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
};

export default function Index() {
  const { links, getLink } = useLinkStore();
  const { setModal } = useModalStore();

  const { settings } = useLocalSettingsStore();

  const session = useSession();
  const userId = session.data?.user.id;

  const [link, setLink] = useState<LinkIncludingShortenedCollectionAndTags>();
  const [linkContent, setLinkContent] = useState<LinkContent>();
  const [imageError, setImageError] = useState<boolean>(false);
  const [colorPalette, setColorPalette] = useState<RGBColor[]>();

  const router = useRouter();

  useEffect(() => {
    const fetchLink = async () => {
      if (router.query.id) {
        await getLink(Number(router.query.id));
      }
    };

    fetchLink();
  }, []);

  useEffect(() => {
    if (links[0]) setLink(links.find((e) => e.id === Number(router.query.id)));
  }, [links]);

  useEffect(() => {
    const fetchLinkContent = async () => {
      if (
        router.query.id &&
        link?.readabilityPath &&
        link?.readabilityPath !== "pending"
      ) {
        const response = await fetch(
          `/api/v1/archives/${link?.id}?format=${ArchivedFormat.readability}`
        );

        const data = await response?.json();

        setLinkContent(data);
      }
    };

    fetchLinkContent();
  }, [link]);

  useEffect(() => {
    let interval: NodeJS.Timer | undefined;
    if (
      link?.screenshotPath === "pending" ||
      link?.pdfPath === "pending" ||
      link?.readabilityPath === "pending"
    ) {
      interval = setInterval(() => getLink(link.id as number), 5000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [link?.screenshotPath, link?.pdfPath, link?.readabilityPath]);

  const colorThief = new ColorThief();

  const rgbToHex = (r: number, g: number, b: number): string =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  useEffect(() => {
    const banner = document.getElementById("link-banner");
    const bannerInner = document.getElementById("link-banner-inner");

    if (colorPalette && banner && bannerInner) {
      if (colorPalette[0] && colorPalette[1]) {
        banner.style.background = `linear-gradient(to bottom, ${rgbToHex(
          colorPalette[0][0],
          colorPalette[0][1],
          colorPalette[0][2]
        )}20, ${rgbToHex(
          colorPalette[1][0],
          colorPalette[1][1],
          colorPalette[1][2]
        )}20)`;
      }

      if (colorPalette[2] && colorPalette[3]) {
        bannerInner.style.background = `linear-gradient(to bottom, ${rgbToHex(
          colorPalette[2][0],
          colorPalette[2][1],
          colorPalette[2][2]
        )}30, ${rgbToHex(
          colorPalette[3][0],
          colorPalette[3][1],
          colorPalette[3][2]
        )})30`;
      }
    }
  }, [colorPalette]);

  return (
    <LinkLayout>
      <div className={`flex flex-col max-w-screen-md h-full`}>
        <div
          id="link-banner"
          className="link-banner relative bg-opacity-10 border-neutral-content"
        >
          {/* <div id="link-banner-inner" className="link-banner-inner"></div> */}

          <div className={`relative flex flex-col gap-3 items-start`}>
            <div className="flex gap-3 items-start">
              {!imageError && link?.url && (
                <Image
                  src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link.url}&size=32`}
                  width={42}
                  height={42}
                  alt=""
                  id={"favicon-" + link.id}
                  className="bg-white shadow rounded-md p-1 select-none mt-1"
                  draggable="false"
                  onLoad={(e) => {
                    try {
                      const color = colorThief.getPalette(
                        e.target as HTMLImageElement,
                        4
                      );

                      setColorPalette(color);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  onError={(e) => {
                    setImageError(true);
                  }}
                />
              )}
              <div className="flex flex-col">
                <p className="text-xl">
                  {unescapeString(link?.name || link?.description || "")}
                </p>
                {link?.url ? (
                  <Link
                    href={link?.url || ""}
                    title={link?.url}
                    target="_blank"
                    className="hover:opacity-60 duration-100 break-all text-sm flex items-center gap-1 text-neutral w-fit"
                  >
                    <FontAwesomeIcon icon={faLink} className="w-4 h-4" />

                    {isValidUrl(link?.url || "")
                      ? new URL(link?.url as string).host
                      : undefined}
                  </Link>
                ) : undefined}
              </div>
            </div>

            <div className="flex gap-1 items-center flex-wrap">
              <Link
                href={`/collections/${link?.collection.id}`}
                className="flex items-center gap-1 cursor-pointer hover:opacity-60 duration-100 mr-2 z-10"
              >
                <FontAwesomeIcon
                  icon={faFolder}
                  className="w-5 h-5 drop-shadow"
                  style={{ color: link?.collection.color }}
                />
                <p
                  title={link?.collection.name}
                  className="text-lg truncate max-w-[12rem]"
                >
                  {link?.collection.name}
                </p>
              </Link>
              {link?.tags.map((e, i) => (
                <Link key={i} href={`/tags/${e.id}`} className="z-10">
                  <p
                    title={e.name}
                    className="btn btn-xs btn-ghost truncate max-w-[19rem]"
                  >
                    #{e.name}
                  </p>
                </Link>
              ))}
            </div>

            <p className="min-w-fit text-sm text-neutral">
              {link?.createdAt
                ? new Date(link?.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : undefined}
            </p>

            {link?.name ? <p>{link?.description}</p> : undefined}
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex flex-col gap-5 h-full">
          {link?.readabilityPath?.startsWith("archives") ? (
            <div
              className="line-break px-1 reader-view"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(linkContent?.content || "") || "",
              }}
            ></div>
          ) : (
            <div className="border border-solid border-neutral-content w-full h-full flex flex-col justify-center p-10 rounded-2xl bg-base-200">
              {link?.readabilityPath === "pending" ? (
                <p className="text-center">
                  Generating readable format, please wait...
                </p>
              ) : (
                <>
                  <p className="text-center text-2xl">
                    There is no reader view for this webpage
                  </p>
                  <p className="text-center text-sm">
                    {link?.collection.ownerId === userId
                      ? "You can update (refetch) the preserved formats by managing them below"
                      : "The collections owners can refetch the preserved formats"}
                  </p>
                  {link?.collection.ownerId === userId ? (
                    <div
                      onClick={() =>
                        link
                          ? setModal({
                              modal: "LINK",
                              state: true,
                              active: link,
                              method: "FORMATS",
                            })
                          : undefined
                      }
                      className="mt-4 flex gap-2 w-fit mx-auto relative items-center font-semibold select-none cursor-pointer p-2 px-3 rounded-md dark:hover:bg-sky-600 text-white bg-sky-700 hover:bg-sky-600 duration-100"
                    >
                      <FontAwesomeIcon
                        icon={faBoxesStacked}
                        className="w-5 h-5 duration-100"
                      />
                      <p>Manage preserved formats</p>
                    </div>
                  ) : undefined}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </LinkLayout>
  );
}
