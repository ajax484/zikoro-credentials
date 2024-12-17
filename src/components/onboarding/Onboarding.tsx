"use client";
import {
  SpCheck,
  SProgress1,
  SProgress2,
  SProgress3,
  SProgress4,
  SProgress5,
} from "@/constants";
import React, { useState } from "react";
import { useOnboarding } from "@/hooks";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const countryList = [
  "Afghanistan",
  "Åland Islands",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas (the)",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia (Plurinational State of)",
  "Bonaire, Sint Eustatius and Saba",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory (the)",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands (the)",
  "Central African Republic (the)",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands (the)",
  "Colombia",
  "Comoros (the)",
  "Congo (the Democratic Republic of the)",
  "Congo (the)",
  "Cook Islands (the)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Curaçao",
  "Cyprus",
  "Czechia",
  "Côte d'Ivoire",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic (the)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands (the) [Malvinas]",
  "Faroe Islands (the)",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories (the)",
  "Gabon",
  "Gambia (the)",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Heard Island and McDonald Islands",
  "Holy See (the)",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran (Islamic Republic of)",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea (the Democratic People's Republic of)",
  "Korea (the Republic of)",
  "Kuwait",
  "Kyrgyzstan",
  "Lao People's Democratic Republic (the)",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands (the)",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia (Federated States of)",
  "Moldova (the Republic of)",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands (the)",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger (the)",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "Northern Mariana Islands (the)",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine, State of",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines (the)",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Republic of North Macedonia",
  "Romania",
  "Russian Federation (the)",
  "Rwanda",
  "Réunion",
  "Saint Barthélemy",
  "Saint Helena, Ascension and Tristan da Cunha",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin (French part)",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Sint Maarten (Dutch part)",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Georgia and the South Sandwich Islands",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan (the)",
  "Suriname",
  "Svalbard and Jan Mayen",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan (Province of China)",
  "Tajikistan",
  "Tanzania, United Republic of",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands (the)",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates (the)",
  "United Kingdom of Great Britain and Northern Ireland (the)",
  "United States Minor Outlying Islands (the)",
  "United States of America (the)",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela (Bolivarian Republic of)",
  "Viet Nam",
  "Virgin Islands (British)",
  "Virgin Islands (U.S.)",
  "Wallis and Futuna",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const industryList = [
  "Medical Clinics",
  "Dentists",
  "Psychologists",
  "Physiologist",
  "Acupuncure",
  "Chiropractor",
  "Physical Therapists",
  "Prosthectics and Orthotics",
  "Coaching",
  "Charity",
  "Professional Services",
  "Government and Public Sector",
  "Fitness and Sports",
  "Beauty, Hair and Nair Salons",
  "Barber",
  "Spa",
  "Personal Trainers",
  "Design Constations",
  "Counselling",
  "Cleaning Services",
  "Religious Consultations",
  "Interview Scheduling",
  "Financial Services",
  "Business Advisory",
  "Legal Services",
  "City Councils",
  "Equipment Rentals",
  "Restuarants",
  "Tutoring services",
  "Education and Non-Profits",
];

type SearchParamsType = {
  email: string;
  createdAt: string;
};

type FormData = {
  referralCode: string;
  referredBy: string;
  phoneNumber: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  industry: string;
};

export function generateAlphanumericHash(length?: number): string {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const hashLength = length || 18;
  let hash = "";

  for (let i = 0; i < hashLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    hash += characters.charAt(randomIndex);
  }

  return hash;
}

export default function OnboardingForm({
  searchParams: { email, createdAt },
}: {
  searchParams: SearchParamsType;
}) {
  const [isRefferalCode, setIsReferralCode] = useState<boolean>(false);
  const { loading, registration } = useOnboarding();

  const [formData, setFormData] = useState({
    referralCode: "",
    referredBy: "",
    phoneNumber: "",
    city: "",
    country: "",
    firstName: "",
    lastName: "",
    industry: "",
  });

  const router = useRouter();
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const stages = ["stage1", "stage2", "stage3", "stage4", "stage5"];

  // State to track the current paragraph index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Handlers for next

  const handleNext = () => {
    if (currentIndex < stages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  //Handlers for previous
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  //create user
  async function handleCreateUser(e: React.FormEvent, values: FormData) {
    e.preventDefault();
    const payload = {
      ...values,
      phoneNumber: values.phoneNumber
        ? `+${values.phoneNumber.replace(/^(\+)?/, "")}`
        : "",
      referralCode: generateAlphanumericHash(10).toUpperCase(),
      referredBy: values.referredBy.toUpperCase(),
    };
    try {
      await registration(payload, email, createdAt);
      handleNext();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  }

  return (
    <div>
      {/* 1st */}
      {currentIndex === 0 && (
        <div className="px-3 lg:px-0 max-w-full lg:max-w-[835px] mt-6 lg:mt-10 mx-auto pb-[100px]">
          <div className="flex mx-auto justify-center">
            <SProgress1 />
          </div>
          <div className="mt-6 lg:mt-[52px] ">
            <p className="text-black text-[20px] font-semibold w-full text-center">
              Do you have a referral code?
            </p>
            {/* buttons */}
            <div className="w-full flex">
              <div className="flex gap-x-[8px] mt-8 mx-auto ">
                {/* 1st button */}
                <div className="flex flex-col cursor-pointer rounded-[8px] gap-y-[18px] pt-[11px] bg-white border-[1px] border-gray-200 hover:border-indigo-800 w-[100px] h-[100px]">
                  <div className="flex mx-auto">
                    <input
                      type="radio"
                      name="referral"
                      id=""
                      className="text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-600"
                      size={16}
                      onClick={() => setIsReferralCode(false)}
                    />
                  </div>
                  <p className="text-[14px] font-normal text-center">No</p>
                </div>

                {/* 2nd Button */}
                <div className="flex flex-col cursor-pointer rounded-[8px] gap-y-[18px] pt-[11px] bg-white border-[1px] border-gray-200 hover:border-indigo-800 w-[100px] h-[100px]">
                  <div className="flex mx-auto">
                    <input
                      type="radio"
                      name="referral"
                      id=""
                      className="text-indigo-600"
                      size={16}
                      onClick={() => setIsReferralCode(true)}
                    />
                  </div>
                  <p className="text-[14px] font-normal text-center">Yes</p>
                </div>
              </div>
            </div>

            {/* ref code */}
            {isRefferalCode && (
              <div className="mt-6 w-full md:w-[458px] mx-auto">
                <p>Referral</p>
                <input
                  type="text"
                  placeholder="Enter Referral Code "
                  className=" text-[#1f1f1f] placeholder-black bg-transparent outline-none border-[1px] border-gray-200 hover:border-indigo-600 w-full pl-[10px] py-4 rounded-[6px] mt-3"
                  value={formData.referredBy}
                  name="referredBy"
                  id=""
                  onChange={handleChange}
                />
              </div>
            )}

            {/* nav buttons */}
            <div className="flex items-center justify-center mx-auto  mt-6 ">
              <button
                onClick={handleNext}
                disabled={currentIndex === stages.length - 1}
                className="text-white rounded-[8px] font-semibold text-base bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end py-3 px-4 "
              >
                Next
              </button>{" "}
            </div>
          </div>
        </div>
      )}

      {/* 2nd */}
      {currentIndex === 1 && (
        <div className="px-3 lg:px-0 max-w-full lg:max-w-[835px] mt-6 lg:mt-10 mx-auto pb-[100px]">
          <p className="w-full lg:w-[835px] font-medium text-center hidden lg:block">
            We need this information to personalize your experience, tailor
            services to your location, and ensure secure account setup.
          </p>
          <p className="w-full lg:w-[835px] font-medium text-center block lg:hidden">
            We ask for your phone number, city, and country to personalize your
            experience, tailor services to your location, and ensure secure
            account setup.
          </p>
          <div className="max-w-full lg:max-w-[458px] mx-auto">
            <div className="flex mx-auto justify-center">
              <SProgress2 />
            </div>
            <div className="mt-6 lg:mt-[52px] ">
              {/* 1st input */}
              <div>
                <p className="text-black text-[14px] ">Phone Nuber</p>
                <div className="flex gap-x-[10px] items-center border-[1px] border-gray-200 hover:border-indigo-600 w-full pl-[10px] py-4 rounded-[6px] mt-3">
                  <p>+</p>
                  <input
                    type="tel"
                    placeholder="234 001 002 0003"
                    className=" text-[#1f1f1f] placeholder-gray-500 bg-transparent outline-none "
                    name="phoneNumber"
                    id=""
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    autoComplete="off"
                    min={11}
                    max={13}
                  />
                </div>
              </div>

              <div className="mt-[29px]">
                <p className="text-black text-[14px] ">City</p>
                <div className=" border-[1px] border-gray-200 hover:border-indigo-600 w-full pl-[10px] py-4 rounded-[6px] mt-3">
                  <input
                    type="text"
                    placeholder="Enter Your City"
                    className=" text-[#1f1f1f] placeholder-gray-500 bg-transparent outline-none "
                    name="city"
                    id=""
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="mt-[29px]">
                <p className="text-black text-[14px] ">Country</p>
                <div className=" border-[1px] border-gray-200 hover:border-indigo-600 w-full px-[9px] py-[16px] rounded-[6px] mt-3">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    id=""
                    className="w-full  bg-transparent rounded-md border-[1px] text-gray-500 text-base border-none  outline-none "
                  >
                    <option
                      disabled
                      selected
                      value=""
                      className="bg-transparent text-gray-500"
                    >
                      Select Your Country
                    </option>
                    {countryList.map((country) => (
                      <option
                        value={country}
                        className="bg-transparent text-gray-500"
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* nav buttons */}
              <div className="flex items-center justify-center gap-x-4 mx-auto mt-[52px] ">
                <button
                  onClick={handlePrev}
                  className="text-indigo-500 font-semibold text-base border-[1px] border-indigo-500  py-3 px-4 rounded-[8px]"
                >
                  Prev
                </button>{" "}
                <button
                  onClick={() => {
                    if (!formData.city) {
                      toast.error("Please fill out all required fields!");
                    } else {
                      handleNext();
                    }
                  }}
                  disabled={currentIndex === stages.length - 1}
                  className="text-white font-semibold text-base bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end py-3 px-4 rounded-[8px]"
                >
                  Next
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 3rd */}
      {currentIndex === 2 && (
        <div className="px-3 lg:px-0 max-w-full lg:max-w-[835px] mt-6 lg:mt-10 mx-auto pb-[100px]">
          <p className=" w-full lg:w-[835px] font-medium text-center">
            Your name allows us to personalize communication and also address
            you properly.
          </p>
          <div className="max-w-full lg:max-w-[458px] mx-auto mt-8">
            <div className="flex mx-auto justify-center">
              <SProgress3 />
            </div>
            <div className="mt-6 lg:mt-[52px] ">
              {/* 1st input */}
              <div>
                <p className="text-black text-[14px] ">First Name</p>
                <div className=" gap-x-[10px] border-[1px] border-gray-200 hover:border-indigo-600 w-full pl-[10px] py-4 rounded-[6px] mt-3">
                  <input
                    type="text"
                    placeholder="Enter First Name "
                    className=" text-[#1f1f1f] placeholder-black bg-transparent outline-none "
                    name="firstName"
                    id=""
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mt-[29px]">
                <p className="text-black text-[14px] ">Last Name</p>
                <div className=" border-[1px] border-gray-200 hover:border-indigo-600 w-full pl-[10px] py-4 rounded-[6px] mt-3">
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    className=" text-[#1f1f1f] placeholder-black bg-transparent outline-none "
                    name="lastName"
                    id=""
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* nav buttons */}
              <div className="flex items-center justify-center gap-x-4 mx-auto mt-[52px] ">
                <button
                  onClick={handlePrev}
                  className="text-indigo-500 font-semibold text-base border-[1px] border-indigo-500  py-3 px-4 rounded-[8px]"
                >
                  Prev
                </button>{" "}
                <button
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName) {
                      toast.error("Please fill out all required fields!");
                    } else {
                      handleNext();
                    }
                  }}
                  disabled={currentIndex === stages.length - 1}
                  className="text-white font-semibold text-base bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end py-3 px-4 rounded-[8px]"
                >
                  Next
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4th */}
      {currentIndex === 3 && (
        <div className="px-3 lg:px-0 max-w-full lg:max-w-[835px] mt-6 lg:mt-10 mx-auto pb-[100px]">
          <p className=" w-full xl:w-[835px] text-[14px] lg:text-base font-medium text-center">
            Understanding your industry helps us provide features, resources,
            and updates that align with your professional needs.
          </p>
          <div className="max-w-[458px] mx-auto">
            <div className="flex mx-auto justify-center">
              <SProgress4 />
            </div>
            <div className="mt-6 lg:mt-[52px] ">
              {/* 1st input */}

              <div className="mt-[29px]">
                <p className="text-black text-[11px] lg:text-[14px] ">
                  Which of these options best describes your industry
                </p>
                <div className=" border-[1px] border-gray-200 hover:border-indigo-600 w-full px-[9px] py-[16px] rounded-[6px] mt-3">
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    id=""
                    className="w-full  bg-transparent rounded-md border-[1px] text-black text-base border-none  outline-none "
                  >
                    <option
                      disabled
                      selected
                      value=""
                      className="text-[14px] lg:text-base bg-transparent text-black"
                    >
                      Select Your Industry
                    </option>
                    {industryList.map((industry) => (
                      <option
                        value={industry}
                        className=" text-[14px] lg:text-base bg-transparent text-black"
                      >
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* nav buttons */}
              <div className="flex items-center justify-center gap-x-4 mx-auto mt-[52px] ">
                <button
                  onClick={handlePrev}
                  className="text-indigo-500 font-semibold text-base border-[1px] border-indigo-500  py-3 px-4 rounded-[8px]"
                >
                  Prev
                </button>{" "}
                <button
                  onClick={(e) => {
                    handleCreateUser(e, formData);
                  }}
                  disabled={currentIndex === stages.length - 1}
                  className="text-white font-semibold text-base bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end py-3 px-4 rounded-[8px]"
                >
                  {loading && <LoaderAlt size={22} className="animate-spin" />}
                  Create Profile
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 5th */}
      {currentIndex === 4 && (
        <div className="px-3 lg:px-0 max-w-full lg:max-w-[603px] mt-6 lg:mt-10 mx-auto pb-[100px]">
          <div className="flex mx-auto justify-center">
            <SProgress5 />
          </div>
          <div className="mt-[24px] lg:mt-[52px] ">
            <div className="flex justify-center">
              <SpCheck />
            </div>
            <p className="text-black text-[20px] font-semibold text-center mt-6 ">
              Congratulations {formData.firstName}{" "}
            </p>

            <p className="text-black font-medium text-center mt-3">
              Your profile has been created successfully, start exploring zikoro
              bookings!{" "}
            </p>

            {/* buttons */}
            <div className="flex justify-center gap-x-4 mx-auto mt-[52px] ">
              <button
                onClick={() => router.push("/engagements")}
                className="text-white font-semibold text-base bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end py-3 px-4 rounded-[8px]"
              >
                Start Exploring
              </button>{" "}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
