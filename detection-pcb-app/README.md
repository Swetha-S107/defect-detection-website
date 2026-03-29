# PCB Defect Detection App

This project is organized into frontend, backend, and dataset folders.

## Folder Structure
- `frontend/`: React application (Vite + Tailwind CSS)
- `backend/`: Express server with Gemini AI integration
- `database/`: SQLite database storage (`pcb_vision.db`)
- `dataset/`: Folder for storing your PCB datasets and trained models.
  - `models/`: Place your trained model weights here (e.g., `pcb_defect_model.bin`).
  - `images/`: Place your training and validation images here.
  - `dataset_info.json`: Metadata about your trained dataset.

## How to run locally in Visual Studio Code

1. **Prerequisites**:
   - Install [Node.js](https://nodejs.org/) (v18 or higher)
   - Get a [Gemini API Key](https://aistudio.google.com/app/apikey)

2. **Setup**:
   - Open this folder in VS Code.
   - Open a terminal and run:
     ```bash
     npm install
     ```

3. **Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add your Gemini API Key:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```
   - (Optional) Add SMTP settings for support emails as shown in `backend/.env.example`.

4. **Run the App**:
   - Start the development server:
     ```bash
     npm run dev
     ```
   - Open your browser at `http://localhost:3000`.

5. **Local Model (No External API)**:
   - Place your YOLOv8 model file in `dataset/models/` (recommend `pcb_defect_model.pt`).
   - Install Python dependencies:
     ```bash
     pip install ultralytics pillow
     ```
   - The backend route `/api/predict` now calls `backend/yolo_predict.py`.
   - No Gemini API key is required for image inference.

## Dataset
You mentioned your datasets are already trained and kept in your file manager. You can integrate them into the `backend/` or `frontend/` logic as needed for your specific detection workflow.
