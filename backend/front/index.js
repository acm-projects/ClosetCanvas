
const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")

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

    // Step 2️⃣: Upload the file directly to S3 using the signed URL
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