/// <reference path="serendip.d.ts" />

async (data, model) => {


  const collection = await modules.sbc.db.collection('Entities', false);

  //  res.json(await collection.count({ _entity: 'email' }));
 
  return {
    // handlebars: Modules.handlebars,
    model: { ok: 'true' }
  };
};
