import { formatName } from "@main/helpers";
import axios from "axios";
import { JSDOM } from "jsdom";
import { requestWebPage } from "./repack-tracker/helpers";
import { HowLongToBeatCategory } from "@types";

export interface HowLongToBeatResult {
  game_id: number;
  profile_steam: number;
}

export interface HowLongToBeatSearchResponse {
  data: HowLongToBeatResult[];
}

export const searchHowLongToBeat = async (gameName: string) => {
  const response = await axios.post(
    "https://howlongtobeat.com/api/search",
    {
      searchType: "games",
      searchTerms: formatName(gameName).split(" "),
      searchPage: 1,
      size: 100,
    },
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Referer: "https://howlongtobeat.com/",
      },
    },
  );

  return response.data as HowLongToBeatSearchResponse;
};

// prettier-ignore
export const getHowLongToBeatGame = async (
  id: string,
): Promise<HowLongToBeatCategory[]> => {
  const response = await requestWebPage(`https://howlongtobeat.com/game/${id}`);

  const { window } = new JSDOM(response);
  const { document } = window;

  const items = document.querySelectorAll<HTMLLIElement>(".shadow_shadow ul > li");

  return Array.from(items, (item) => {
    const title = item.querySelector("h4")?.textContent;
    const [, accuracyClassName] = Array.from(item.classList);

    const accuracy = accuracyClassName.split("time_").at(1);

    return <HowLongToBeatCategory>{
      title,
      duration: item.querySelector("h5")?.textContent,
      accuracy,
    };
  });
};
