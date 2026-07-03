import { I18nPlugin } from "@11ty/eleventy";
import pangu from "pangu";
import translations from "./src/_data/translations.js";

const panguSkippedTags = new Set(["script", "style", "code", "pre", "textarea"]);

function getTranslationValue(language, key) {
  return key.split(".").reduce((value, part) => {
    if (value && Object.prototype.hasOwnProperty.call(value, part)) {
      return value[part];
    }

    return undefined;
  }, translations[language]);
}

function normalizeDate(date) {
  return date instanceof Date ? date : new Date(date);
}

function applyPanguToHtmlText(html) {
  const parts = html.split(/(<[^>]+>)/g);
  const skippedTagStack = [];

  return parts
    .map((part) => {
      if (!part) {
        return part;
      }

      if (part.startsWith("<")) {
        const tagMatch = part.match(/^<\s*\/?\s*([a-zA-Z0-9-]+)/);

        if (tagMatch) {
          const tagName = tagMatch[1].toLowerCase();

          if (panguSkippedTags.has(tagName)) {
            const isClosingTag = /^<\s*\//.test(part);
            const isSelfClosingTag = /\/\s*>$/.test(part);

            if (isClosingTag) {
              const index = skippedTagStack.lastIndexOf(tagName);

              if (index !== -1) {
                skippedTagStack.splice(index, 1);
              }
            } else if (!isSelfClosingTag) {
              skippedTagStack.push(tagName);
            }
          }
        }

        return part;
      }

      if (skippedTagStack.length > 0) {
        return part;
      }

      return pangu.spacingText(part);
    })
    .join("");
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(I18nPlugin, {
    defaultLanguage: "zh",
    filters: {
      url: "locale_url",
      links: "locale_links",
    },
    errorMode: "allow-fallback",
  });

  eleventyConfig.addFilter("t", (key, lang = "zh") => {
    return getTranslationValue(lang, key) ?? getTranslationValue("zh", key) ?? key;
  });

  eleventyConfig.addFilter("byLang", (collection = [], lang = "zh") => {
    return collection.filter((item) => item.data?.lang === lang || item.data?.page?.lang === lang);
  });

  eleventyConfig.addFilter("htmlDateString", (date) => {
    return normalizeDate(date).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("formatDate", (date, lang = "zh") => {
    const locale = lang === "en" ? "en-US" : "zh-CN";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(normalizeDate(date));
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ public: "/" });

  eleventyConfig.addTransform("pangu-spacing", function (content) {
    const outputPath = this.page?.outputPath || "";

    if (!outputPath.endsWith(".html")) {
      return content;
    }

    if (!outputPath.includes("/zh/")) {
      return content;
    }

    return applyPanguToHtmlText(content);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
