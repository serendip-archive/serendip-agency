/// <reference path="serendip.d.ts" />

async () => {
 
  return {
    handlebars: Modules.handlebars,
    model: {
      svgPartial : (number) => "svg-" + number
    }
  };
};
