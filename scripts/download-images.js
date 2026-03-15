const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const products = [
  { id: 1, fileId: '1QxKRLK9vbXt8b2_0xTSi-SURFryY8dXh' },
  { id: 2, fileId: '1xabeavZF19RoaiLGXkB_Q7mtj7xDHkve' },
  { id: 3, fileId: '1mkQFeNT2SA4Q4VDfExhrYTloRFn2akgP' },
  { id: 4, fileId: '1YqbtzYRfpOBmJH2kHCnwVHJ45xbywBfl' },
  { id: 5, fileId: '19uCEGxA7bx-LxG2sTtgB-L-X5Ur4rPKI' },
  { id: 6, fileId: '11bgcAX4tlDr4BZ96Df3iSJLWsDUqQmnH' },
  { id: 7, fileId: '1uhyhKZQ9JwXCs7JV53wnpSxzsXyJPL6M' },
  { id: 8, fileId: '1gg7SuExEhSjbRb_YHZdNfj9BDRDgV2EQ' },
  { id: 9, fileId: '11bgcAX4tlDr4BZ96Df3iSJLWsDUqQmnH' },
  { id: 10, fileId: '1Vb1wEihvP1fqhMCmWEddhoJJnLWbKBiW' },
  { id: 11, fileId: '1aziZ7o58EL9Nma7UXsufDbU2myLgxUhs' },
  { id: 12, fileId: '1PIrGhz0JPC-DFcNLy84RRuL5qKKvoOAV' },
  { id: 13, fileId: '1MTADtqZ-TGRiXjPnvtrN5xAxQnt5CYQd' },
  { id: 14, fileId: '16Eh28H0hhOg2tjaTTEkbMKwOUrZ32GD8' },
  { id: 15, fileId: '1c-AQfdmQXVuVbwwep8rocBnnKn1W0I81' },
  { id: 16, fileId: '1vYLhg42idRODoEFnZi6S5sf3io5Rbjpb' },
  { id: 17, fileId: '1rMmk_6M96eZdp8AUdfL6u0lY_1p4Lg2D' },
  { id: 18, fileId: '1pI3qAKgZzkUZIMev3NXOmxxIoyPl6Je0' },
  { id: 19, fileId: '1yA_zxXzfp58GDzq6hFaq93WBG0FTufLA' },
  { id: 20, fileId: '1J8B2AcJZjUUBFFA9Yc5AQZPU1IVDwg8Y' },
  { id: 21, fileId: '1YLvSSi0qznC3sI_IH7ii_x3pWnvTAWyC' },
  { id: 22, fileId: '1XcrSGzr_t_1cgmE0X4S-ojyY9WlxGVMB' },
  { id: 23, fileId: '1Ybv0rNQesjrDA13NYP0uG99LBN2zE9sO' },
  { id: 24, fileId: '1n8f7HmOZUv8D2QYhCZXWJyI99Y5v10s7' },
  { id: 25, fileId: '11NM3lNKm6XtO3YZ5KrvG5AIEuY4aYDxz' },
  { id: 26, fileId: '15FJa57-dRr0AnXRdQj_I31As32A8JBv2' },
  { id: 27, fileId: '16Rk2nQ-xhgvp4yfAXN3YpU35uo9WLkTg' },
  { id: 28, fileId: '1VkA7VheXCJikVjNKST1F1gSXRdml99Br' },
  { id: 29, fileId: '144-tZebOud_XcjZBj3e5hVgp9vaI6RWO' },
  { id: 30, fileId: '1n1fc45NkdDdkphlvrfT0dHDf4aezSpi1' },
  { id: 31, fileId: '1BJ39-JTqSbzqNidM5KitUchXh5i3HHrn' },
  { id: 32, fileId: '1yG7JjxAGrNt5AkhBBkWfSi9glQp8DBvw' },
  { id: 33, fileId: '18BHZ2EvVKI9p8IeJcUbgAhv0GYVMge1n' },
  { id: 34, fileId: '18aOsknCaIkTd-iObGcoaYA6-BnZ_SHYP' },
  { id: 35, fileId: '1rYJQCCLFEwyHBxLnqV3XTCVyguByDhgG' },
  { id: 36, fileId: '1oIhMH0HyZG5sXDnqYKCYezRQWDARtjiW' },
  { id: 37, fileId: '1QYOHKWIDGSRYsgGfOUQzyliDnoNNeZe2' },
  { id: 38, fileId: '1C_CGZrXxwkcteNv6i4GZIUPQHpXqbLFM' },
  { id: 39, fileId: '1BJ83vf1KevK00SBLobQfHv02ADSNNJm-' },
  { id: 40, fileId: '1B63cQ7FdmnYEHHwsH7UVQGh0KzOODWFc' },
  { id: 41, fileId: '1Hy4D9_V62Yn7clTb5-PLUvXZx9frZIMA' },
  { id: 42, fileId: '1HEG-5Kk4Q-XxACBIPnwRAtsYc7jH0NvU' },
  { id: 43, fileId: '1yLbccMyqlzgI64ZykhRBlV_6FwWD15yL' },
  { id: 44, fileId: '1TK8edJR1FN3HaQUAlfauGuh-n1aI-OVr' },
  { id: 45, fileId: '1D8NDTRpfhSshWth4WfZhnDE123bPQe3M' },
  { id: 46, fileId: '1yGuCgSPj9g1Iz3n2RgwBImIHpO58LtMB' },
  { id: 47, fileId: '1FKSwo5yV8LX-LhUz00bzpb_fG36tVtB-' },
  { id: 48, fileId: '1jMUWO1frPahHKw9U-oQQzYO_uNCafL0s' },
  { id: 49, fileId: '1bqv60M2xIn_zTI8Twg63LPZJL8LDGzWH' },
  { id: 50, fileId: '1ZhlIRl0tQ5Vkzbz6TB3fslxfCuRVx4qL' },
  { id: 51, fileId: '10nEGJV06Am2k4dyttaHNJUQM5e2rz0HV' },
  { id: 52, fileId: '1ug710h3QCnRPK1ChK7u8xBzDAf3Ij1Hb' },
  { id: 53, fileId: '1ZX3iAa4JWqBwCzhPxXAfCyaH6f2dmb9G' },
  { id: 54, fileId: '1PQJIKrowIb6wXEGk6GsK8GDWvfN_JngH' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(30000, () => { request.destroy(); reject(new Error('Timeout')); });
  });
}

async function downloadAll() {
  let success = 0, fail = 0;
  // Download 4 at a time
  for (let i = 0; i < products.length; i += 4) {
    const batch = products.slice(i, i + 4);
    const promises = batch.map(async (p) => {
      const dest = path.join(outputDir, `product-${p.id}.jpg`);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        console.log(`  [${p.id}] Already exists, skipping`);
        success++;
        return;
      }
      const url = `https://drive.google.com/uc?export=view&id=${p.fileId}`;
      try {
        await downloadFile(url, dest);
        const size = fs.statSync(dest).size;
        if (size < 1000) {
          fs.unlinkSync(dest);
          throw new Error('File too small');
        }
        console.log(`  [${p.id}] Downloaded (${Math.round(size/1024)}KB)`);
        success++;
      } catch (err) {
        console.log(`  [${p.id}] FAILED: ${err.message}`);
        fail++;
      }
    });
    await Promise.all(promises);
  }
  console.log(`\nDone! ${success} success, ${fail} failures`);
}

console.log(`Downloading ${products.length} product images...\n`);
downloadAll();
