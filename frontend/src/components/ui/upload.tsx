import * as React from "react";

interface UploadProps {
  id: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Upload: React.FC<UploadProps> = ({ id, onChange }) => {

  return (
    <div className="flex items-center justify-center w-full h-12 border border-gray-300 rounded-md cursor-pointer">
      <input
        type="file"
        id={id}
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="text-gray-600 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-2">Upload File</span>
      </label>
    </div>
  );
};

export default Upload;