import SettingsLayout from "@/layouts/SettingsLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import useAccountStore from "@/store/account";
import { AccountSettings } from "@/types/global";
import { toast } from "react-hot-toast";
import SubmitButton from "@/components/SubmitButton";
import React from "react";
import Checkbox from "@/components/Checkbox";
import LinkPreview from "@/components/LinkPreview";
import useLocalSettingsStore from "@/store/localSettings";

export default function Appearance() {
  const { updateSettings } = useLocalSettingsStore();
  const submit = async () => {
    setSubmitLoader(true);

    const load = toast.loading("Applying...");

    const response = await updateAccount({
      ...user,
    });

    toast.dismiss(load);

    if (response.ok) {
      toast.success("Settings Applied!");
    } else toast.error(response.data as string);
    setSubmitLoader(false);
  };

  const [submitLoader, setSubmitLoader] = useState(false);

  const { account, updateAccount } = useAccountStore();

  const [user, setUser] = useState<AccountSettings>(
    !objectIsEmpty(account)
      ? account
      : ({
          // @ts-ignore
          id: null,
          name: "",
          username: "",
          email: "",
          emailVerified: null,
          blurredFavicons: null,
          image: "",
          isPrivate: true,
          // @ts-ignore
          createdAt: null,
          whitelistedUsers: [],
        } as unknown as AccountSettings)
  );

  function objectIsEmpty(obj: object) {
    return Object.keys(obj).length === 0;
  }

  useEffect(() => {
    if (!objectIsEmpty(account)) setUser({ ...account });
  }, [account]);

  return (
    <SettingsLayout>
      <p className="capitalize text-3xl font-thin inline">Appearance</p>

      <div className="divider my-3"></div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-3">Select Theme</p>
          <div className="flex gap-3 w-full">
            <div
              className={`w-full text-center outline-solid outline-neutral-content outline dark:outline-neutral-700 h-40 duration-100 rounded-md flex items-center justify-center cursor-pointer select-none bg-black ${
                localStorage.getItem("theme") === "dark"
                  ? "dark:outline-primary text-primary"
                  : "text-white"
              }`}
              onClick={() => updateSettings({ theme: "dark" })}
            >
              <FontAwesomeIcon icon={faMoon} className="w-1/2 h-1/2" />
              <p className="text-2xl">Dark Theme</p>

              {/* <hr className="my-3 outline-1 outline-neutral-content dark:outline-neutral-700" /> */}
            </div>
            <div
              className={`w-full text-center outline-solid outline-neutral-content outline dark:outline-neutral-700 h-40 duration-100 rounded-md flex items-center justify-center cursor-pointer select-none bg-white ${
                localStorage.getItem("theme") === "light"
                  ? "outline-primary text-primary"
                  : "text-black"
              }`}
              onClick={() => updateSettings({ theme: "light" })}
            >
              <FontAwesomeIcon icon={faSun} className="w-1/2 h-1/2" />
              <p className="text-2xl">Light Theme</p>
              {/* <hr className="my-3 outline-1 outline-neutral-content dark:outline-neutral-700" /> */}
            </div>
          </div>
        </div>

        {/* <SubmitButton
          onClick={submit}
          loading={submitLoader}
          label="Save"
          className="mt-2 mx-auto lg:mx-0"
        /> */}
      </div>
    </SettingsLayout>
  );
}
