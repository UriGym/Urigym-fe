import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { searchAddress, type AddressResult } from "@/lib/daumPostcode";

interface AddressSearchFieldProps {
  id?: string;
  label?: string;
  value: string;
  /** Called with the full result so callers that need it (e.g. to geocode) can use zonecode too. */
  onPicked: (result: AddressResult) => void;
  required?: boolean;
}

/** Read-only address input filled only via the Daum Postcode popup — no free-typed addresses. */
export const AddressSearchField = ({
  id = "address",
  label = "주소",
  value,
  onPicked,
  required,
}: AddressSearchFieldProps) => {
  const handleSearch = async () => {
    try {
      onPicked(await searchAddress());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주소 검색에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="flex gap-2">
        <Input id={id} value={value} readOnly placeholder="주소 검색을 눌러 입력해주세요" className="flex-1" />
        <Button type="button" variant="outline" onClick={handleSearch} className="shrink-0">
          <Search className="w-4 h-4 mr-1.5" />
          주소 검색
        </Button>
      </div>
    </div>
  );
};
