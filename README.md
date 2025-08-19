# Getting Started

Install Docker. Build the image (via `DEV_build_image`), then start the container (`DEV_start_container`). You should be able to connect to the local react development server on port 3000 (`http://localhost:3000`).

If you need to ask an AI about the code, you can use `DEV_get_raw_urls.ps1` to generate the links to all the code files.


# Usage

Once the app is running, you need to download the datasets. Navigate to the `/data` URL to check the state of the data on the backend, and start the necessary download/transformation operations.


# Architecture

The frontend app is built using React.

An Express server runs in the backend. It is responsible for downloading and maintaining data, which it then serves to the React frontend.