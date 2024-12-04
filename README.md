# Abstract Altitudes

Welcome to the **Abstract Altitudes**! This website is designed to display stunning aerial photography and videography captured during my drone flights. Explore the beauty of landscapes, cityscapes, and unique perspectives that only drone photography can provide.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## Features

- **Image Gallery**: View high-quality images organized by categories.
- **Detailed Metadata**: Each image includes EXIF data such as date, location, and camera settings.
- **Responsive Design**: The website is optimized for both desktop and mobile devices.

## Technologies Used

This project is built using the following technologies:

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Metadata Database**: MongoDB Atlas
- **Cloud Storage**: AWS S3
- **Image Processing**: Sharp
- **Reverse Geocoding**: Mapbox
- **Environment Management**: dotenv for managing environment variables

## Installation

To get started with this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/wrangel/globschi.git
   ```

2. Navigate to the project directory:

   ```bash
   cd globschi
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Set up your environment variables:

   - Create a `.env` file in the root directory and add your configuration (e.g., MongoDB Atlas credentials, AWS keys).

5. Use the helper functions:

   ```bash
   pnpm run manage {keep-books|upload-media|add-field|debug-mongo|test-aws}
   pnpm run manage keep-books # Synchronizes data and metadata between and within data and metadata storages
   pnpm run manage debug-mongo # Test if metadata storage is available
   pnpm run manage test-aws # Test if data storage is available
   ```

6. Start the application:

   ```bash
   pnpm run dev -u # Run locally after updating the project
   pnpm run dev # Run locally
   pnpm run test # Run containerized app locally
   pnpm run prod # Deploy images to Docker Hub
   ```

7. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

Once the application is running, you can explore the gallery of images. Click on any image to view it in detail, along with its metadata.

## Contributing

Contributions are welcome! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or feedback, please reach out to me at:

- GitHub: [wrangel](https://github.com/wrangel)

## Acknowledgments

I would like to express my gratitude to **Perplexity.ai**, which has been instrumental in helping me throughout this project. Its powerful capabilities for information discovery and content generation have significantly enhanced my workflow and decision-making process.

---

Thank you for visiting my Abstract Altitudes!
