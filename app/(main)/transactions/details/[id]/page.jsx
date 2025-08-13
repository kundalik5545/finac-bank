"use client";
import { useParams } from "next/navigation";
import React from "react";

const TransDetails = () => {
  const { id } = useParams();
  return (
    <div>
      <h1>Transaction Details</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default TransDetails;
