import { LEVELS_01_06 } from "./levels-01-06.mjs";
import { LEVELS_07_12 } from "./levels-07-12.mjs";
import { LEVELS_13_17 } from "./levels-13-17.mjs";
import { LEVELS_18_22 } from "./levels-18-22.mjs";

export const TOPIC_CONTENT = {
  ...LEVELS_01_06,
  ...LEVELS_07_12,
  ...LEVELS_13_17,
  ...LEVELS_18_22,
};

/** Apply rich content overrides to createTopic opts */
export function enrichTopic(title, baseOpts = {}) {
  const content = TOPIC_CONTENT[title];
  if (!content) return baseOpts;

  return {
    ...baseOpts,
    overview: content.overview,
    whyItExists: content.whyItExists,
    internalWorking: content.internalWorking,
    realWorldUsage: content.realWorldUsage,
    codeExample: content.codeExample,
    productionCode: content.productionCode,
    bestPractices: content.bestPractices,
    commonMistakes: content.commonMistakes,
    interviewQuestions: content.interviewQuestions,
    links: content.links ? [...(baseOpts.links ?? []), ...content.links] : baseOpts.links,
  };
}
