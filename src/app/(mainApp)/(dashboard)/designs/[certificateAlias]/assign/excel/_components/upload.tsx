import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import * as XLSX from "xlsx";
import ExceltoPNG from "@/public/images/exceltopc.png";

const Upload = ({
  setExcelResult,
  step,
  setStep,
}: {
  setExcelResult: Dispatch<SetStateAction<any>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file);
  };

  const readFile = async () => {
    console.log(selectedFile)
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target) {
        const data = e.target.result;

        const dt = XLSX.read(data, { type: "binary" });
        const first_worksheet = dt.Sheets[dt.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(first_worksheet, {
          header: 1,
        }) as string[][];

        if (jsonData[0].length > 2) {
          setExcelResult(jsonData);
          setStep(2);
        } else {
          toast({
            description:
              "There should be three columns: first name, last name, email",
            variant: "destructive",
          });
        }
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center pt-8">
        <Image src={ExceltoPNG} width={200} height={200} alt={"excel to pc"} />
      </div>
      <div className="space-y-2">
        <div className="flex gap-4">
          <Input
            disabled
            className="flex-[70%] bg-gray-200 text-gray-700"
            placeholder={
              selectedFile ? selectedFile.name : "Upload an excel sheet file"
            }
          />
          <label
            htmlFor="excel"
            className="hover:cursor-pointer flex justify-center items-center gap-6 h-10 w-full border border-gray-300 bg-gray-200 px-3 py-2 text-sm flex-[30%]"
          >
            Choose File
          </label>
          <input
            name="excel"
            id="excel"
            type="file"
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          upload spreadsheet with the information of recipients
        </span>
      </div>
      <Button
        onClick={readFile}
        disabled={!selectedFile}
        className="bg-basePrimary w-full"
      >
        Continue
      </Button>
    </div>
  );
};

export default Upload;
