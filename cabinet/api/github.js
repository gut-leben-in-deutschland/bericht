import Github from 'github-api';

let instances = {};
const github = (token) => {
  if (!instances[token]) {
    instances[token] = new Github(token ? {
      token
    } : undefined);
  }
  return instances[token];
};

const mdRe = /\.md$/;
const dsvRe = /\.(tsv|csv)$/;
const imageRe = /\.(jpe?g|gif|png|svg)$/;

export default (config, auth, parsers) => {
  const getRepo = () => {
    return github(auth.getToken())
      .getRepo(config.github.username, config.github.reponame);
  };

  const getImage = (path, callback) => {
    getRepo().getContents(config.github.ref, path, false, (error, data) => {
      if (error) {
        callback(error);
        return;
      }
      callback(null, data.download_url);
    });
  };

  const getMarkdown = (path, callback) => {
    getRepo().getContents(config.github.ref, path, true, (error, content) => {
      if (error) {
        callback(error);
        return;
      }
      callback(null, parsers.markdown(content));
    });
  };

  const getDsv = (path, callback) => {
    getRepo().getContents(config.github.ref, path, true, (error, content) => {
      if (error) {
        callback(error);
        return;
      }
      callback(null, parsers[dsvRe.exec(path)[1]](content));
    });
  };

  return {
    loadFile(path, callback) {
      if (mdRe.test(path)) {
        return getMarkdown(path, callback);
      } else if (dsvRe.test(path)) {
        return getDsv(path, callback);
      } else if (imageRe.test(path)) {
        return getImage(path, callback);
      }
      return callback(new Error(`no appropriate loader for path '${path}'`));
    }
  };
};
