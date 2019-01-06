/// <reference path="serendip.d.ts" />

async () => {
  Modules.handlebars.registerHelper(
    "unsafe",
    c => new Modules.handlebars.SafeString(c)
  );
  return {
    handlebars: Modules.handlebars,
    model: {
      name: "mohsen",
      footer: {
        site_name: "serendip.cloud"
      }
    }
  };
};
