document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const imageFile = document.getElementById('image').files[0];

    if (!name || !imageFile) {
        alert("Please fill in all fields.");
        return;
    }

    // Convert the image to Base64
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async function() {
        const base64Image = reader.result.split(',')[1]; // Get Base64 content

        // GitHub API configurations
        const githubToken = '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';
        const repoOwner = 'test1Demo123';
        const repoName = 'test';
        const imagePath = `images/${imageFile.name}`;
        const jsonPath = 'applicants.json';

        // Upload the image to GitHub
        const uploadImageResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add image ${imageFile.name}`,
                content: base64Image
            })
        });

        if (uploadImageResponse.ok) {
            // Fetch the current applicants.json file
            const currentDataResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${jsonPath}`, {
                headers: {
                    'Authorization': `Bearer ${githubToken}`
                }
            });

            const currentDataJson = await currentDataResponse.json();
            const currentData = JSON.parse(atob(currentDataJson.content));

            // Add the new applicant data
            currentData.push({
                name: name,
                image: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${imagePath}`
            });


            // Upload updated JSON file
            const updatedJsonContent = btoa(JSON.stringify(currentData, null, 2)); // Base64 encode JSON
            const uploadJsonResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${jsonPath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update applicants.json with ${name}`,
                    content: updatedJsonContent,
                    sha: currentDataJson.sha // Use the SHA from the existing file
                })
            });

            if (uploadJsonResponse.ok) {
                alert("Applicant added successfully!");
            } else {
                alert("Failed to update JSON.");
            }
        } else {
            alert("Failed to upload image.");
        }
    };
});

