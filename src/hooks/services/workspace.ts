"use client";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Changed from react-toastify to react-hot-toast to keep consistency
import { createClient } from "@/utils/supabase/client";