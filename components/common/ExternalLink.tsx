import { type ComponentProps } from "react";

import { Platform } from "react-native";

import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      // @ts-ignore - expo-router types don't properly handle string hrefs
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
