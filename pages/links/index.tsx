import LinkCard from "@/components/LinkCard";
import NoLinksFound from "@/components/NoLinksFound";
import SortDropdown from "@/components/SortDropdown";
import useLinks from "@/hooks/useLinks";
import MainLayout from "@/layouts/MainLayout";
import useLinkStore from "@/store/links";
import { Sort } from "@/types/global";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function Links() {
  const { links } = useLinkStore();

  const [sortBy, setSortBy] = useState<Sort>(Sort.DateNewestFirst);

  useLinks({ sort: sortBy });

  return (
    <MainLayout>
      <div className="p-5 flex flex-col gap-5 w-full h-full">
        <div className="flex gap-3 justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faLink}
              className="sm:w-10 sm:h-10 w-6 h-6 text-primary drop-shadow"
            />
            <div>
              <p className="text-3xl capitalize font-thin">All Links</p>

              <p>Links from every Collections</p>
            </div>
          </div>

          <div className="relative mt-2">
            <SortDropdown sortBy={sortBy} setSort={setSortBy} />
          </div>
        </div>
        {links[0] ? (
          <div className="grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-5">
            {links.map((e, i) => {
              return <LinkCard key={i} link={e} count={i} />;
            })}
          </div>
        ) : (
          <NoLinksFound text="You Haven't Created Any Links Yet" />
        )}
      </div>
    </MainLayout>
  );
}
