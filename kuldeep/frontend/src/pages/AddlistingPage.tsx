import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import  Upload  from "@/components/ui/upload";
import ImageUpload from "@/components/upload/ImageUpload";
import axios from "axios"

const AddListingPage = () => {
  const [propertyName, setPropertyName] = React.useState("");
  const [propertyAddress, setPropertyAddress] = React.useState("");
  const [propertyCostRange, setPropertyCostRange] = React.useState("");
  const [roomPhotoId, setRoomPhotoId] = React.useState<string | null>(null);
  const [bathroomPhotoId, setBathroomPhotoId] = React.useState<string | null>(null);
  const [drawingRoomPhotoId, setDrawingRoomPhotoId] = React.useState<string | null>(null);
  const [kitchenPhotoId, setKitchenPhotoId] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState("");
  const [document, setDocument] = React.useState(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (
        propertyName &&
        propertyAddress &&
        propertyCostRange
        // roomPhotoId &&
        // bathroomPhotoId &&
        // drawingRoomPhotoId &&
        // kitchenPhotoId &&
        // document
        ) {
            axios.post("http://localhost:5090/addListing",{
                 headers: {
          "Content-Type": "application/json",
        },
                propertyName:propertyName,
                propertyAddress:propertyAddress,
                propertyCostRange:propertyCostRange,
                roomPhotoId:roomPhotoId,
                bathroomPhotoId:bathroomPhotoId,
                drawingRoomPhotoId:drawingRoomPhotoId,
                kitchenPhotoId:kitchenPhotoId,
                description:description,
                // document:document
            }).then(res => {
                console.log(res)
            })
            .catch(err => {
                console.error("Error fetching response:", err);
            });
        
        
            
        // Handle form submission logic here
        } else {
        alert("Please fill in all required fields");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  type="text"
                  id="propertyName"
                  value={propertyName}
                  onChange={(event) => setPropertyName(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  type="text"
                  id="propertyAddress"
                  value={propertyAddress}
                  onChange={(event) => setPropertyAddress(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="propertyCostRange">Property Cost</Label>
                <div className="flex items-center">
                    <span className="mr-2">₹</span>
                    <Input
                        type="Number"
                        id="propertyCostRange"
                        value={propertyCostRange}
                        onChange={(event) => setPropertyCostRange(event.target.value)}
                        required
                    />
                </div>
                
              </div>
              <div>
                <Label htmlFor="roomPhoto">Room Photo</Label>
                <ImageUpload
                  id="roomPhoto"
                  label="Upload Room Photo"
                  onUploadSuccess={(result) => {
                    setRoomPhotoId(result.data?.fileId);
                    console.log("Room photo uploaded:", result.data?.fileId);
                  }}
                  onUploadError={(error) => {
                    console.error("Room photo upload failed:", error);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="bathroomPhoto">Bathroom Photo</Label>
                <ImageUpload
                  id="bathroomPhoto"
                  label="Upload Bathroom Photo"
                  onUploadSuccess={(result) => {
                    setBathroomPhotoId(result.data?.fileId);
                    console.log("Bathroom photo uploaded:", result.data?.fileId);
                  }}
                  onUploadError={(error) => {
                    console.error("Bathroom photo upload failed:", error);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="drawingRoomPhoto">Drawing Room Photo</Label>
                <ImageUpload
                  id="drawingRoomPhoto"
                  label="Upload Drawing Room Photo"
                  onUploadSuccess={(result) => {
                    setDrawingRoomPhotoId(result.data?.fileId);
                    console.log("Drawing room photo uploaded:", result.data?.fileId);
                  }}
                  onUploadError={(error) => {
                    console.error("Drawing room photo upload failed:", error);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="kitchenPhoto">Kitchen Photo</Label>
                <ImageUpload
                  id="kitchenPhoto"
                  label="Upload Kitchen Photo"
                  onUploadSuccess={(result) => {
                    setKitchenPhotoId(result.data?.fileId);
                    console.log("Kitchen photo uploaded:", result.data?.fileId);
                  }}
                  onUploadError={(error) => {
                    console.error("Kitchen photo upload failed:", error);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="document">Upload Document</Label>
                <Upload
                  id="document"
                  onChange={(event) => setDocument(event.target.files[0])}
                />
              </div>
            </div>
            <Button variant="hero" type="submit">
              <Plus className="h-4 w-4 mr-1" />
              Add Listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddListingPage;