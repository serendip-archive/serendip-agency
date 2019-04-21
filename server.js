() => {
  return class server {
    constructor(modules) {
      this.modules = modules;
    }

    async start() {
      this.modules.SBC.DbService.options = {
        defaultProvider: "Mongodb",
        providers: {
          Mongodb: {
            object: new this.modules.SMP.MongodbProvider(),
            options: {
              mongoDb: process.env["db.mongoDb"],
              mongoUrl: process.env["db.mongoUrl"],
              authSource: process.env["db.authSource"],
              user: process.env["db.user"],
              password: process.env["db.password"]
            }
          }
        }
      };

      const dbService = new this.modules.SBC.DbService();

      await dbService.start();

      this.modules.sbc = {
        db: dbService
      };

    }

    async onRequest(req, res, inputs) {
      
      return {
        data: {
          
        }
      }
    }

  }

}
