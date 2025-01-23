import { Image, StyleSheet, Platform, Button, Text, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { TextInput } from 'react-native-gesture-handler';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';

export default function HomeScreen() {
  const [bearerToken, setBearerToken] = useState<string>('')
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([])
  const [uploadingProgress, setUploadingProgress] = useState<number>(0)

  
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      selectionLimit: 10,
      allowsMultipleSelection: true
    })

    setImages(result.assets || [])
  }

  const uploadImages = async () => {
    for (const image of images) {
      let imageToUpload: Blob = image.file || new Blob
      setUploadingProgress(uploadingProgress + 1)

      if (imageToUpload) {
        if (imageToUpload?.size > 2999999) {
          imageToUpload = await compressImage(imageToUpload)
        }
        
        const formData = new FormData()
    
        formData.append('file', imageToUpload)
        console.log('Uploading image', imageToUpload)
        try {
          const res = await fetch('https://test-api.ghd.com/SmartApp/api/upload/', {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${bearerToken}`
            },
            body: formData
          })
          console.log('Successfully uploaded images', res)
        } catch (error) {
          console.log('Something went wrong upload images', error)
        }
      }
    }
    setUploadingProgress(0)
  }

  const compressImage = async (image: Blob, compressionAmount = 0.8): Promise<Blob> => {
    let imageToCompress = image

    /* if (Platform.OS === "web") {
      const Compressor = require('compressorjs')

      const compressedWebImage = new Promise((resolve, _) => {
        new Compressor(imageToCompress, {quality: compressionAmount, success(result: unknown) {
          resolve(result)
        }})
      })
      const compressedImage = await compressedWebImage
      imageToCompress = compressedImage as Blob
    } else {
      const compressedNativeImage = new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.readAsDataURL(imageToCompress)
        reader.onloadend = async () => {
          const compressedResult = await ImageCompressor.compress(reader.result as string, {quality: compressionAmount})
          resolve(compressedResult)
        }
      })
      const compressedImage = await compressedNativeImage
      imageToCompress = compressedImage as Blob
    } */

    const compressedNativeImage = new Promise((resolve, _) => {
      const reader = new FileReader()
      reader.readAsDataURL(imageToCompress)
      reader.onloadend = async () => {
        const compressedResult = await ImageCompressor.compress(reader.result as string, {quality: compressionAmount})
        resolve(compressedResult)
      }
    })
    const compressedImage = await compressedNativeImage
    imageToCompress = compressedImage as Blob

    if (imageToCompress.size > 2999999) {
      return compressImage(imageToCompress, compressionAmount - 0.1)
    }

    return imageToCompress
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <Button title={images.length ? `Uploaded ${images.length} image(s)`: 'Select Images'} onPress={pickImages} />
      <View style={{gap: 6}}>
        <Text>Bearer Token</Text>
        <TextInput style={{padding: 6, borderRadius: 4, borderColor: "#333333", borderWidth: 1}} value={bearerToken} onChangeText={setBearerToken} placeholder='Bearer Token'/>
      </View>
      <Button title='Upload Images' onPress={uploadImages}/>
      <Text>Currently Uploading {JSON.stringify(images[uploadingProgress - 1])}</Text>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
  },
});