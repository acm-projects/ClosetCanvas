
const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")

imageForm.addEventListener("submit", async event => {
  event.preventDefault()
  const file = imageInput.files[0]
  if (!file) return alert("Please select a file first!")

  // get secure url from our server
  const { url } = await fetch(
  `http://localhost:8080/s3Url?filename=${encodeURIComponent(file.name)}&filetype=${encodeURIComponent(file.type)}`
).then(res => res.json());

  
    console.log("Upload URL:", url)

  // post the image direclty to the s3 bucket
  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  })

  const imageUrl = url.split('?')[0]
  console.log("Uploaded image URL:", imageUrl)

  // post request to my server to store any extra data
  
  
  const img = document.createElement("img")
  img.src = imageUrl
  document.body.appendChild(img)
})