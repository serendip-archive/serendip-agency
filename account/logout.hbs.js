/// <reference path="../serendip.d.ts" />

async (data, model) => {


    const cookies = modules.cookies(req, res);


    cookies.set('access_token', '');

    res.writeHead(302, {
        'Location': `/`
        //add other headers here...
    });

    return res.end();

};
