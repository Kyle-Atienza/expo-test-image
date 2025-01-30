import {
  Image,
  StyleSheet,
  Button,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
export default function HomeScreen() {
  const { colors } = useTheme();

  const [bearerToken, setBearerToken] = useState<string>("");
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadingProgress, setUploadingProgress] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);
  const [expand, setExpand] = useState<number>();

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
      const file =
        Platform.OS === "web"
          ? image.file
          : ({
              uri:
                Platform.OS === "android"
                  ? image.uri
                  : image.uri.replace("file://", ""),
              name: image.fileName,
              type: image.mimeType,
            } as any);
      console.log("uploading image", file);
      await uploadImage(file);
    }
    setUploadingProgress("");
  };

  const uploadImage = async (file: any, retry = 0) => {
    setUploadingProgress("Uploading image attempt " + (retry + 1));
    console.log("Uploading image try", retry + 1);
    const formData = new FormData();
    formData.append("file", file);
    let log: any;

    console.log("fetch start");
    const res = await fetch("https://test-api.ghd.com/SmartApp/api/upload/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });
    console.log("fetch end", res);
    log = {
      res: res,
      uploadedDate: new Date().toLocaleString(),
      file: file,
      name: file.name,
    };
    setLogs((prevState) => [log, ...prevState]);
    console.log("Successfully uploaded images", res);
    if (retry < 2 && !res.ok) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return uploadImage(file, retry + 1);
    }

    console.log(logs);
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
      {uploadingProgress && <Text>{uploadingProgress}</Text>}
      <Button title="Clear Logs" onPress={() => setLogs([])} />
      <View key={logs.length}>
        {logs.map((log, index) => {
          return (
            <View
              key={index}
              style={{
                borderBottomColor: "black",
                borderBottomWidth: 1,
                marginBottom: 18,
                paddingBottom: 18,
                overflow: "visible",
              }}
            >
              <View>
                <Text>{logs.length - index}.</Text>
                <Text>Name: {log.name}</Text>
                <Text>Date: {log.uploadedDate}</Text>
                <Text>Success: {String(log.res.ok)}</Text>
                <TouchableOpacity
                  onPress={() => setExpand(expand === index ? -1 : index)}
                  style={{
                    padding: 6,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ color: "white" }}>
                    See {expand === index ? "Less" : "More"}
                  </Text>
                </TouchableOpacity>
                {expand === index && (
                  <View>
                    {log.file && (
                      <View>
                        <Text style={{ fontWeight: 800 }}>Form Data:</Text>
                        <View>
                          <Text style={{ fontWeight: 600 }}>uri:</Text>
                          <Text style={{ flex: 1 }}>{log.file.uri}</Text>
                        </View>
                        <View>
                          <Text style={{ fontWeight: 600 }}>name:</Text>
                          <Text>{log.file.name}</Text>
                        </View>
                        <View>
                          <Text style={{ fontWeight: 600 }}>type:</Text>
                          <Text>{log.file.type}</Text>
                        </View>
                      </View>
                    )}
                    {log.res && (
                      <View>
                        <Text style={{ fontWeight: 800, marginTop: 10 }}>
                          Response:
                        </Text>
                        <View>
                          <Text>{JSON.stringify(log.res, null, 2)}</Text>
                        </View>
                      </View>
                    )}
                    {log.error && (
                      <View>
                        <Text style={{ fontWeight: 800 }}>Error:</Text>
                        <View style={{ marginTop: 10 }}>
                          <Text>{log.error.message}</Text>
                          <Text>{log.error.stack}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
