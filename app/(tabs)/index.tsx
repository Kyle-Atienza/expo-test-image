import { Image, StyleSheet, Button, View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
export default function HomeScreen() {
  const {colors} = useTheme()

  const [bearerToken, setBearerToken] = useState<string>("");
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadingProgress, setUploadingProgress] = useState<number>(0);
  const [logs, setLogs] = useState<any[]>([])
  const [expand, setExpand] = useState<number>()

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
      setUploadingProgress(uploadingProgress + 1);

      let imageToUpload: Blob = image.file || new Blob();

      const formData = new FormData();
      const file = Platform.OS === "web" ? image.file :  {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      } as any
      formData.append("file", file);

      let log
      
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
        console.log("fetch end",);
        if (!res) {
          throw new Error("Failed to upload images");
        }
        log = {result: "success"}
        const json = await res.json();
        console.log("Successfully uploaded images", json);
      } catch (error) {
        log = {result: "fail"}
        console.log("Something went wrong upload images", error);
      }

      setLogs(prevState => [{...log, uploadedDate: new Date().toLocaleString(), file: file}, ...prevState])
      console.log(logs)
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
    {
      uploadingProgress > 0 && <Text>
      Currently Uploading
    </Text>
    }
    <Text>Logs</Text>
    <Button title="Clear Logs" onPress={() => setLogs([])} />
    <View key={logs.length}>
      {
        logs.map((log, index) => {
          return <View key={index} style={{paddingBottom: 18, borderColor: "black", borderBottomWidth: 1, marginBottom: 18}}>
            <Text>Result: {log.result}</Text>
            <Text>Date: {log.uploadedDate}</Text>
            <TouchableOpacity
              onPress={() => setExpand(expand === index ? -1 : index)}
              style={{padding: 6, borderRadius: 4, backgroundColor: colors.primary,  alignSelf: "flex-start"}}>
              <Text style={{color: "white"}}>
                See More
              </Text>
            </TouchableOpacity>
            {
              expand === index && <View>
                <Text>uri: {log.file.uri}</Text>
                <Text>name: {log.file.name}</Text>
                <Text>type: {log.file.type}</Text>
              </View>
            }
          </View>
        })
      }
    </View>
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