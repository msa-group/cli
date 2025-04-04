const fs = require('fs');

function Router(req, res, next) {
  const router = RouterMap[req.path];
  if (router) {
    router(req, res, next);
  }
  next();
}


const RouterMap = {
  '/api/config': (req, res) => {
    const debugConfigContent = fs.existsSync("config.debug.yml") ? fs.readFileSync("config.debug.yml", 'utf8') : '';
    res.json({
        code: 200,
        data: {
          debugConfigContent
        }
    })
  },
  '/api/spec': (req, res) => {
    const filePath = req.query.filePath;
    const key = req.query.key;
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    res.json({
        code: 200,
        data: {
          content,
          key
        }
    })
  },
  '/api/msa': (req, res) => {
    const filePath = req.query.filePath;
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    res.json({
        code: 200,
        data: {
          content,
        }
    })
  }
}

module.exports = Router;