import { Text, View, ScrollView, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import React, { useState, useEffect, useCallback } from "react";
import CustomButton from "../../components/CustomButton";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { dbLite } from "../../../firebase/firebase-config";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore/lite";
import { authentication } from "../../../firebase/firebase-config";
import { signOut } from "firebase/auth";
import CustomInput from "../../components/CustomInput";
import FileInput from "../../components/FileInput";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase/firebase-config";
import moment from "moment";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { interestsStore } from "../../store/firebase/interests";
import { usajobsStore } from "../../store/usajobs";

const ProfileScreen = observer(() => {
  const [isSignedIn, setIsSignedIn] = useState(!!!authentication.currentUser);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [interestStore, setinterestStore] = useState({});

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blobFile, setBlobFile] = useState([]);
  const [fileName, setFileName] = useState([]);
  const [completed, setCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // this will be called every time the screen becomes focused
      interestsStore.getInterests().then((interests) => {
        // wait until Promise resolves and set the initial 3 opportunities
        setinterestStore(toJS(interests));
      });

      return () => {
        // this will be called when the screen becomes unfocused
        // you can do any cleanup here (e.g. cancel async tasks)
      };
    }, [])
  );

  // get user data and display it
  useEffect(() => {
    const getDocument = async () => {
      setLoading(true);

      try {
        const docRef = doc(
          dbLite,
          "userProfiles",
          authentication.currentUser.uid
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFirstName(docSnap.get("First Name"));
          setLastName(docSnap.get("Last Name"));
          setOccupation(docSnap.get("occupation"));
          setinterestStore(docSnap.get("interests"));
        } else {
          setData(undefined);
          console.log("No document!");
        }
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    getDocument();
  }, []);

  const usajobsPressed = async () => {
    usajobsStore.searchJobs();
    // usajobsStore.searchCodes();
  };

  // set the user data in firestore db
  // press events can be async
  const onSetDataPressed = async () => {
    //Add a new document in collection "userProfiles"
    await updateDoc(
      doc(dbLite, "userProfiles", authentication.currentUser.uid),
      {
        "First Name": firstName,
        "Last Name": lastName,
        email: authentication.currentUser.email,
        occupation: occupation,
        interests: interestStore,
      }
    );
    navigation.navigate("Home");
  };

  const onSignOutPressed = () => {
    signOut(authentication)
      .then((re) => {
        setIsSignedIn(false);
        navigation.navigate("SignIn");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFileInformation = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result != null) {
      const document = await fetch(result.uri);
      const documentBlob = await document.blob();
      setFileName(result.name);
      setBlobFile(documentBlob);
    }
  };

  const uploadFile = (blobFile, fileName, isUploadCompleted) => {
    if (!blobFile) return;
    const currentDate = moment().format("DD_MM_YYYY");
    const storageRef = ref(
      storage,
      `RESUME_${authentication.currentUser.uid}_${lastName}_${firstName}_${currentDate}`
    );
    const uploadTask = uploadBytesResumable(storageRef, blobFile);
    uploadTask.on(
      "state_changed",
      null,
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          isUploadCompleted(true);
          return downloadURL;
        });
      }
    );
  };

  const isUploadCompleted = (completed) => {
    setCompleted(completed);
  };

  const onUploadResumePressed = () => {
    getFileInformation();
    uploadFile(blobFile, fileName, isUploadCompleted);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        maxWidth: 400,
        flexGrow: 1,
        alignSelf: "center",
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.root}>
        <Text
          style={{
            fontSize: 24,
            color: "white",
          }}
        >
          User Profile
        </Text>
        <CustomInput
          placeholder={
            firstName === null || undefined ? { firstName } : "First Name"
          }
          value={firstName}
          setValue={setFirstName}
        />
        <CustomInput
          placeholder={
            lastName === null || undefined ? { lastName } : "Last Name"
          }
          value={lastName}
          setValue={setLastName}
        />
        <CustomInput
          placeholder={
            occupation === null || undefined ? { occupation } : "Occupation"
          }
          value={occupation}
          setValue={setOccupation}
        />
        <FileInput onPress={onUploadResumePressed} />
        {completed && <Text style={{ color: "white" }}>Resume Stored!</Text>}
        <CustomButton text="Apply & Go Back" onPress={onSetDataPressed} />
        <CustomButton text="Jobs" onPress={usajobsPressed} />
        <CustomButton
          text="Clear interests & Birthday"
          onPress={() => {
            interestsStore.clearInterests().then((opportunities) => {
              // wait until Promise resolves
            });
            navigation.navigate("Home");
          }}
        />

        {isSignedIn === !!!authentication.currentUser && (
          <CustomButton text="Sign Out" onPress={onSignOutPressed} />
        )}
      </View>
    </ScrollView>
  );
});

// styles
const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    padding: 50,
  },
  text: {
    maxWidth: 200,
    flexGrow: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
});
const JSONTreeTheme = {
  base00: "transparent",
  base01: "white",
  base02: "white",
  base03: "white",
  base04: "white",
  base05: "white",
  base06: "white",
  base07: "white",
  base08: "white",
  base09: "white",
  base0A: "white",
  base0B: "white",
  base0C: "white",
  base0D: "white",
  base0E: "white",
  base0F: "white",
};
export default ProfileScreen;
