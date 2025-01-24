import { Image, StyleSheet, Button, View, Text, TextInput } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
export default function HomeScreen() {
  const [bearerToken, setBearerToken] = useState<string>("");
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadingProgress, setUploadingProgress] = useState<number>(0);
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      selectionLimit: 10,
      allowsMultipleSelection: true,
    });
    setImages(result.assets || []);
  };
  const uploadImages = async () => {
    for (const image of images) {
      let imageToUpload: Blob = image.file || new Blob();
      setUploadingProgress(uploadingProgress + 1);
      if (imageToUpload) {
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: image.fileName,
          type: imageToUpload.type,
        } as any);
        console.log("Uploading image", imageToUpload);
        try {
          console.log("fetch start");
          const res = await fetch(
            "https://test-api.ghd.com/SmartApp/api/upload/",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "multipart/form-data",
              },
              body: formData,
            }
          );
          console.log("fetch end");
          if (!res) {
            throw new Error("Failed to upload images");
          }
          const json = await res.json();
          console.log("Successfully uploaded images", json);
        } catch (error) {
          console.log("Something went wrong upload images", error);
        }
      }
    }
    setUploadingProgress(0);
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
    >
    <Text>Upload Image Test on iOS</Text>
    <Button
      title={
        images.length ? `Uploaded ${images.length} image(s)` : "Select Images"
      }
      onPress={pickImages}
    />
    <View style={{ gap: 6 }}>
    <Text>Bearer Token</Text>
    <TextInput
      style={{
        padding: 6,
        borderRadius: 4,
        borderColor: "#333333",
        borderWidth: 1,
      }}
      value={bearerToken}
      onChangeText={setBearerToken}
      placeholder="Bearer Token"
    />
    </View>
    <Button title="Upload Images" onPress={uploadImages} />
    <Text>
      Currently Uploading {JSON.stringify(images[uploadingProgress - 1])}
    </Text>
    </ParallaxScrollView>
  );
}
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
}); 