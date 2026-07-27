import { z } from "zod";
import { BLOG_SCHEMA_VERSION, CATEGORY_VALUES } from "./config.mjs";
import { BlogValidationError } from "./errors.mjs";

function characterLength(value) {
  return [...value].length;
}

function containsMarkdown(value) {
  return /(?:\[[^\]]+\]\([^)]+\)|[`<>]|(?:\*\*|__|~~))/.test(value);
}

function plainText(label, minimum, maximum) {
  return z.string().superRefine((value, context) => {
    const length = characterLength(value);
    if (value !== value.trim()) {
      context.addIssue({ code: "custom", message: `${label} must not have surrounding whitespace` });
    }
    if (/[\r\n]/.test(value)) {
      context.addIssue({ code: "custom", message: `${label} must be one line of plain text` });
    }
    if (length < minimum || length > maximum) {
      context.addIssue({
        code: "custom",
        message: `${label} must be between ${minimum} and ${maximum} characters`,
      });
    }
    if (containsMarkdown(value)) {
      context.addIssue({ code: "custom", message: `${label} must not contain Markdown or HTML` });
    }
  });
}

const ISO_DATE_TIME_WITH_TIMEZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|([+-])(\d{2}):(\d{2}))$/;

export function isIsoDateTimeWithTimezone(value) {
  const match = ISO_DATE_TIME_WITH_TIMEZONE.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone, , zoneHourText, zoneMinuteText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;

  if (zone !== "Z") {
    const zoneHour = Number(zoneHourText);
    const zoneMinute = Number(zoneMinuteText);
    if (zoneHour > 14 || zoneMinute > 59 || (zoneHour === 14 && zoneMinute !== 0)) return false;
  }

  return Number.isFinite(Date.parse(value));
}

const isoDateTime = z.string().refine(isIsoDateTimeWithTimezone, {
  message: "must be an ISO 8601 date-time with an explicit timezone",
});

const httpsUrl = z.string().superRefine((value, context) => {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
      context.addIssue({ code: "custom", message: "must be a stable HTTPS URL" });
    }
  } catch {
    context.addIssue({ code: "custom", message: "must be a valid HTTPS URL" });
  }
});

const localImagePath = z.string().refine(
  (value) =>
    value.startsWith("./") &&
    value.length > 2 &&
    !value.slice(2).includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0"),
  { message: "must be a filename in the article directory, prefixed with ./" },
);

const authorSchema = z.strictObject({
  name: plainText("author.name", 2, 80),
  type: z.enum(["Person", "Organization"]),
  url: httpsUrl,
});

const imageSchema = z.strictObject({
  src: localImagePath,
  alt: plainText("image.alt", 20, 240),
});

export const frontmatterSchema = z
  .strictObject({
    schemaVersion: z.literal(BLOG_SCHEMA_VERSION),
    title: plainText("title", 10, 100),
    summary: plainText("summary", 70, 220),
    publishedAt: isoDateTime.optional(),
    updatedAt: isoDateTime.optional(),
    author: authorSchema,
    category: z.enum(CATEGORY_VALUES),
    tags: z
      .array(plainText("tag", 2, 60))
      .min(1, "tags must contain at least one topic")
      .max(8, "tags must contain no more than eight topics")
      .superRefine((tags, context) => {
        const normalized = tags.map((tag) => tag.toLocaleLowerCase("en-US"));
        if (new Set(normalized).size !== tags.length) {
          context.addIssue({ code: "custom", message: "tags must be unique, ignoring case" });
        }
      }),
    image: imageSchema.optional(),
    status: z.enum(["draft", "published"]),
    featured: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (value.status === "published" && !value.publishedAt) {
      context.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "is required for a published article",
      });
    }
    if (value.status === "published" && !value.image) {
      context.addIssue({
        code: "custom",
        path: ["image"],
        message: "is required for a published article",
      });
    }
    if (value.updatedAt && !value.publishedAt) {
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "requires publishedAt",
      });
    }
    if (
      value.updatedAt &&
      value.publishedAt &&
      Date.parse(value.updatedAt) < Date.parse(value.publishedAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "must be equal to or later than publishedAt",
      });
    }
  });

export function validateFrontmatter(value, source) {
  const result = frontmatterSchema.safeParse(value);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `${issue.path.length ? issue.path.join(".") : "frontmatter"} ${issue.message}`)
    .join("; ");
  throw new BlogValidationError(details, source);
}
