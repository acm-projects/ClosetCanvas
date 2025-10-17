const imageForm = document.querySelector("#imageForm");
const imageInput = document.querySelector("#imageInput");
const imageURLInput = document.querySelector("#imageURL");

imageForm.addEventListener("submit", async event => {
  
  event.preventDefault()
  const file = imageInput.files[0]
  if (!file) return alert("Please select a file")

   try {
    // ask lambda for a presigned URL
    const response = await fetch(
      `https://1ag2u91ezb.execute-api.us-east-2.amazonaws.com/production/s3?filename=${encodeURIComponent(file.name)}&filetype=${encodeURIComponent(file.type)}`
    );

    if (!response.ok) throw new Error("Failed to get upload URL.");

    const { uploadURL } = await response.json();

    // upload the file directly to S3 using the signed URL
    const upload = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!upload.ok) throw new Error("Failed to upload file to S3.");

    // success
    console.log("File URL:", uploadURL.split("?")[0]); // final public file URL

  } catch (err) {
    console.error("Upload error:", err);
  }

});




/*

const imageForm = document.querySelector("#imageForm");
const imageInput = document.querySelector("#imageInput");
const imageURLInput = document.querySelector("#imageURL");

async function fetchImageFromURL(imageUrl) {
  // 1️⃣ Try to fetch the URL
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Failed to fetch URL");

  const contentType = response.headers.get("content-type") || "";

  // 2️⃣ If it’s already an image, return the blob
  if (contentType.startsWith("image/")) {
    console.log("Direct image detected:", contentType);
    const blob = await response.blob();
    return { blob, filename: imageUrl.split("/").pop().split("?")[0], type: contentType };
  }

  // 3️⃣ Otherwise, treat as a web page → parse and find the main image
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Try common selectors for e-commerce product images
  const selectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'img[id*="main"], img[class*="main"], img[class*="hero"], img[class*="primary"], img[src*="cdn"]',
    'img',
  ];

  let imageSrc = null;
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) {
      imageSrc = el.content || el.src;
      if (imageSrc) break;
    }
  }

  if (!imageSrc) throw new Error("No image found in the page");

  // Resolve relative URLs
  const resolvedURL = new URL(imageSrc, imageUrl).href;
  console.log("Found image on page:", resolvedURL);

  // Recursively fetch the actual image now
  const imageResp = await fetch(resolvedURL);
  if (!imageResp.ok) throw new Error("Failed to fetch extracted image");
  const blob = await imageResp.blob();

  return {
    blob,
    filename: resolvedURL.split("/").pop().split("?")[0] || "image.jpg",
    type: blob.type || "image/jpeg",
  };
}

imageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    let file, filename, filetype;

    // case 1: User pasted a URL
    if (imageURLInput.value.trim()) {
      const imageUrl = imageURLInput.value.trim();
      const { blob, filename: name, type } = await fetchImageFromURL(imageUrl);
      file = blob;
      filename = name;
      filetype = type;
    }
    // case 2: User selected a local file
    else if (imageInput.files.length > 0) {
      file = imageInput.files[0];
      filename = file.name;
      filetype = file.type;
    } else {
      return alert("Please select a file or enter a URL");
    }

    // 🟦 Ask Lambda for presigned URL
    const res = await fetch(
      `https://1ag2u91ezb.execute-api.us-east-2.amazonaws.com/production/s3?filename=${encodeURIComponent(filename)}&filetype=${encodeURIComponent(filetype)}`
    );
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await res.json();

    // upload to S3
    const upload = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": filetype },
      body: file,
    });
    if (!upload.ok) throw new Error("Failed to upload to S3");

    const finalURL = uploadURL.split("?")[0];
    console.log("Uploaded to S3:", finalURL);
    alert("Upload successful!\n" + finalURL);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed: " + err.message);
  }
});
*/