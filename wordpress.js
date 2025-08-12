const FormData = require('form-data');
const axios = require('axios');

async function uploadImageToWP(imageUrl, filenameHint) {
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const form = new FormData();
  form.append('file', Buffer.from(res.data), { filename: filenameHint });

  const wpUrl = `${process.env.WP_SITE.replace(/\/$/, '')}/wp-json/wp/v2/media`;
  const r = await axios.post(wpUrl, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: 'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')
    }
  });

  return r.data.id;
}

async function createWordpressPost(title, content, featuredMediaId = null) {
  const url = `${process.env.WP_SITE.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
  const body = { title, content, status: 'publish' };
  if (featuredMediaId) body.featured_media = featuredMediaId;

  const res = await axios.post(url, body, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')
    }
  });

  return res.data;
}

module.exports = { uploadImageToWP, createWordpressPost };
