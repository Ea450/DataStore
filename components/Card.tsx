import { Models } from "node-appwrite";
import React from "react";

const Card = ({ file }: { file: Models.Document }) => {
  return <div>{file.$id}</div>;
};

export default Card;
