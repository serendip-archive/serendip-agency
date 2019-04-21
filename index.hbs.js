/// <reference path="serendip.d.ts" />

async (data, model) => {


  const collection = await modules.sbc.db.collection('Entities', false);

  //  res.json(await collection.count({ _entity: 'email' }));
 return res.json({
    data,
    model
  });

 new modules.SF.AuthService()

  return {
    // handlebars: Modules.handlebars,
    model: { ok: 'true' }
  };
};
