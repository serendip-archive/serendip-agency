/// <reference path="serendip.d.ts" />

() => {
  class server {
    /**
     * 
     * @param {modules} modules 
     */
    constructor(modules) {
      this.modules = modules;
    }

    async start() {

      this.modules.handlebars.registerHelper("rpd", string => {
        return (this.modules.utils.text.replaceEnglishDigitsWithPersian(string));
      });

      this.modules.handlebars.registerHelper("syntaxHighlight", obj => {
        var json = JSON.stringify(obj, null, 2);

        json = json
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        var result = json.replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          function (match) {
            var cls = "number";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "key";
              } else {
                cls = "string";
              }
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return '<span class="' + cls + '">' + match + "</span>";
          }
        );
        return new this.modules.handlebars.SafeString(result);
      });

    }

    /**
     * 
     * @param {req} req 
     * @param {res} res 
     * @param {{data : any; model : any}} inputs 
     */
    async onRequest(req, res, inputs) {


      req.query = this.modules.utils.querystring.toObject(req.url);

      const cookies = this.modules.cookies(req, res);

      if (req.url.startsWith('/account')) {

        if (req.query && req.query.code && req.query.codeId) {

          const codeValid = await this.authService.authCodeValid(req.query.codeId, req.query.code);

          const authCode = await this.authService.findAuthCode(req.query.codeId);

          if (!authCode.used) {

            const token = await this.authService.insertToken({
              clientId: 'serendip-agency',
              grant_type: 'authorization_code',
              userId: authCode.userId,
              useragent: req.useragent().toString()
            })

            await this.authService.setAuthCodeUsed(authCode._id.toString());


            cookies.set('access_token', token.access_token);

            res.writeHead(302, {
              'Location': req.query.redirectUri
              //add other headers here...
            });

            return res.end();

          }
        }


        if (!cookies.get('access_token')) {

          const redirectUrl = encodeURIComponent((req.headers.host.startsWith('localhost') ? 'http://' : 'https://') + req.headers.host + req.url)
          res.writeHead(302, {
            'Location': `${inputs.data.env.sso}/?redirectUri=${redirectUrl}&clientId=serendip-agency`
            //add other headers here...
          });
          return res.end();

        }



      }


      if (cookies.get('access_token')) {


        req.body.access_token = cookies.get('access_token');

        try {
          await this.authService.authorizeRequest(req);
        } catch (error) {
          cookies.set('access_token', '');
        }


      }


      return {
        data: {
          req: {
            user: req.user,
            token: req.userToken,
            ip: req.ip(),
            useragent: req.useragent(),
            host: req.headers.host,
            url: req.url,
            query: req.query,
            body: req.body,
            method: req.method
          }
        }
      }
    }

  }

  return server;

}
