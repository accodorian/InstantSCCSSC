import {
  cliExecute,
  fullnessLimit,
  inebrietyLimit,
  myAscensions,
  myFullness,
  myInebriety,
  mySpleenUse,
  print,
  spleenLimit,
  turnsPlayed,
} from "kolmafia";
import { $effect, $effects, CommunityService, get, have, uneffect } from "libram";
import {
  farmingResourcePrefs,
  freeBanishPrefs,
  freeFightPrefs,
  freeKillPrefs,
  notableSkillPrefs,
  potentiallyFreeFightPrefs,
  trackedPref,
} from "../engine/engine";
import { Quest } from "../engine/task";
import { CommunityServiceTests, testNames } from "../lib";

function logPrefUsage(tPref: trackedPref): void {
  const pref = tPref.pref;
  const name = tPref.name;
  const n = tPref.maxUses;

  const localPrefValue = get(`_instant${pref}`, "").split(",").join(", ");
  const prefValue = get(pref);
  const prefValueLength = prefValue.toString() !== "" ? prefValue.toString().split(",").length : 0;

  if (typeof prefValue === "boolean" || prefValue === "true" || prefValue === "false")
    print(
      `${name}: ${prefValue || prefValue === "true" ? n ?? 1 : 0}/${n ?? "?"} ${localPrefValue}`
    );
  else if (
    typeof prefValue === "string" &&
    (isNaN(parseInt(prefValue)) || prefValue.includes(",") || parseInt(prefValue) > (n ?? 1))
  )
    print(
      `${name}: ${prefValueLength > (n ?? 1) ? n ?? 1 : prefValueLength}/${
        n ?? "?"
      } ${localPrefValue}`
    );
  else print(`${name}: ${prefValue}/${n ?? "?"} ${localPrefValue}`);
}

function logResourceUsage(): void {
  // Track resources used
  // Banishes
  print("");
  print("Resource Tracking", "blue");
  [
    { header: "Banishes Used:", prefArr: freeBanishPrefs },
    { header: "Free Kills Used:", prefArr: freeKillPrefs },
    { header: "Notable Skills Used:", prefArr: notableSkillPrefs },
    { header: "Free Fights Used:", prefArr: freeFightPrefs },
    { header: "Potentially Free Fights Used:", prefArr: potentiallyFreeFightPrefs },
    { header: "Farming Resources:", prefArr: farmingResourcePrefs },
  ].map(({ header, prefArr }) => {
    print(header);
    prefArr.map(logPrefUsage);
    print("");
  });

  // Organs Used
  print("Organs Used:");
  print(`Stomach: ${myFullness()}/${fullnessLimit()}`);
  print(`Liver: ${myInebriety()}/${inebrietyLimit()}`);
  print(`Spleen: ${mySpleenUse()}/${spleenLimit()}`);
  print(
    `Sweat Remaining: ${get("sweat")}/100, Sweat Out Some Booze: ${get("_sweatOutSomeBoozeUsed")}/3`
  );

  // Adventures Used
  print("");
  print("Test Summary:");
  for (const test of Array<number>(
    CommunityServiceTests.COILTEST,
    CommunityServiceTests.HOTTEST,
    CommunityServiceTests.HPTEST,
    CommunityServiceTests.MUSTEST,
    CommunityServiceTests.MYSTTEST,
    CommunityServiceTests.MOXTEST,
    CommunityServiceTests.COMTEST,
    CommunityServiceTests.WPNTEST,
    CommunityServiceTests.SPELLTEST,
    CommunityServiceTests.FAMTEST,
    CommunityServiceTests.ITEMTEST
  ))
    print(`${testNames.get(test) ?? "Unknown Test"}: ${get(`_CSTest${test}`, "?")}`);
  print(`Adventures used: ${turnsPlayed()}`);

  print("");
}

export const DonateQuest: Quest = {
  name: "Donate",
  tasks: [
    {
      name: "Test",
      completed: () => get("kingLiberated"),
      do: () => CommunityService.donate(),
      limit: { tries: 1 },
    },
    {
      name: "Empty Hagnks",
      completed: () => get("lastEmptiedStorage") === myAscensions(),
      do: (): void => {
        logResourceUsage();
        print("Emptying Hagnks!", "purple");
        print("Please wait for up to 1 minute...", "blue");
        cliExecute("hagnk all");
      },
      limit: { tries: 1 },
    },
    {
      name: "Shrug Negative Effects",
      completed: () => !have($effect`Feeling Lost`) && !have($effect`Cowrruption`),
      do: (): void => {
        for (const ef of $effects`Feeling Lost, Cowrruption, Cold Hearted`) {
          if (have(ef)) uneffect(ef);
        }
      },
      limit: { tries: 1 },
    },
  ],
};
