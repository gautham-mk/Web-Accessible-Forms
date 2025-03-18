import React, { useState, useRef, useEffect } from 'react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import './App.css';

const App = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        dob: ''
    });

    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const activeInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Speech Recognition Module
    const startSpeechRecognition = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognitionInstance = new window.webkitSpeechRecognition();
        recognitionInstance.lang = "en-US";
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (activeInputRef.current) {
                const fieldName = activeInputRef.current.name;
                setFormData((prevData) => ({
                    ...prevData,
                    [fieldName]: transcript,
                }));
            }
        };

        recognitionInstance.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("Speech recognition failed. Try again.");
            stopSpeechRecognition();
        };

        recognitionInstance.start();
        setRecognition(recognitionInstance);
        setIsListening(true);
    };

    // End Speech Recognition
    const stopSpeechRecognition = () => {
        if (recognition) {
            recognition.stop();
        }
        setIsListening(false);
    };

    // Setting the currently focused field for voice input
    const handleFocus = (e) => {
        activeInputRef.current = e.target;
    };

    const handleChange = (e) => {
        // Handle phoen input (the input is coming as a string and not as a event)
        if (typeof e  === "string") {
            setFormData({ ...formData, phone: e });
        } else {
            console.log(e.target.value);
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const pincodeHandleChange = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (e.target.name === "pincode" && e.target.value.length === 6) {
                setLoading(true);
                fetchLocation(e.target.value);
                setLoading(false);
            }
        }
    };
    

    const fetchLocation = async (pincode) => {
        console.log("entered");
        try {
            const response = await fetch(`http://localhost:5000/api/pincode/${pincode}`);
            if (!response.ok) throw new Error("Invalid Pincode");

            const data = await response.json();
            if (data.PostOffice.length > 0) {
                const place = data.PostOffice[0];
                console.log(place);
                setFormData({
                    ...formData,
                    city: place.District,
                    state: place.State,
                    country: place.Country,
                });
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            alert("Invalid PIN code or service unavailable.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const profileFetch = () => {
        //Profile Fetch Functionality
        console.log('Profile is being fetched');
        alert('Profile Fetched');
    }

    // Listen for keyboard shortcut (Ctrl + M)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === "m") {
                e.preventDefault();
                isListening ? stopSpeechRecognition() : startSpeechRecognition();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isListening]);

    return (
        <form onSubmit={handleSubmit} aria-labelledby="form-title">

            <h1 id="form-title" className="form-title">Registration Form</h1>

            <button
                type="button"
                className="profile-fetch-button"
                onClick={profileFetch}
            >
                Get Profile
            </button>
            
            <p>Use the below button or press Ctrl + M to start using voice to text feature.</p>
            <div className='mic-container'>
                <button
                    type="button"
                    className={`mic-button ${isListening ? "active" : ""}`}
                    onClick={() => (isListening ? stopSpeechRecognition() : startSpeechRecognition())}
                    title="Speak Now"
                >
                    Mic 
                </button>
                {isListening && <p>Listening...</p>}
            </div>
            
            <br /><br />

            {/* Contact Information */}
            <fieldset>
                
                <legend className="fieldset-legend">Contact Information</legend>

                <div className="form-group">

                    <div className="region-container">
                        <div className='input-container'>
                            <label htmlFor="first-name">First Name</label>
                            <input
                                type="text"
                                id="first-name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                required
                                aria-required="true"
                                tabIndex="0"
                            />
                        </div>
                        
                        <div className='input-container'>
                            <label htmlFor="last-name">Last Name</label>
                            <input
                                type="text"
                                id="last-name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                required
                                aria-required="true"
                                tabIndex="0"
                            />
                        </div>
                    </div>

                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        required
                        aria-required="true"
                        tabIndex="0"
                    />

                    <label htmlFor="phone">Phone Number</label>
                    <PhoneInput
                        country={"us"}
                        value={formData.phone}
                        onChange={handleChange}
                        inputProps={{
                            name: "phone",
                            required: true,
                            id: "phone",
                            tabIndex: "0"
                        }}
                    />
                </div>
            </fieldset>
            <br /><br />

            {/* Address Section */}
            <fieldset>

                <legend className="fieldset-legend">Address</legend>

                <div className="form-group">
                    <label htmlFor="address">Street Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onFocus={handleFocus}
                        onChange={handleChange}
                        required
                        tabIndex="0"
                    />

                    <label htmlFor="pincode">Pincode</label>
                    <input 
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        onKeyDown={pincodeHandleChange}
                        required
                        tabIndex="0"
                    />

                    <div className="region-container">

                        <div className="input-container">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onFocus={handleFocus}
                                onChange={handleChange}
                                required
                                tabIndex="0"
                                disabled={loading}
                                placeholder={loading ? "Searching..." : ""}
                            />
                        </div>
                        

                        <div className="input-container">
                            <label htmlFor="state">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onFocus={handleFocus}
                                onChange={handleChange}
                                required
                                tabIndex="0"
                                disabled={loading}
                                placeholder={loading ? "Searching..." : ""}
                            />
                        </div>

                        <div className="input-container">
                            <label htmlFor="country">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onFocus={handleFocus}
                                onChange={handleChange}
                                required
                                tabIndex="0"
                                disabled={loading}
                                placeholder={loading ? "Searching..." : ""}
                            />
                        </div>
                    </div>
                    
                </div>
            </fieldset>
            <br /><br />

            {/* Date of Birth Section */}
            <fieldset>
                <legend className="fieldset-legend">Date of Birth</legend>
                <div className="form-group">
                    <label htmlFor="dob">Select Date</label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        required
                        tabIndex="0"
                    />
                </div>
            </fieldset>

            {/* Submit Button */}
            <button
                type="submit"
                tabIndex="0"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        handleSubmit(e);
                    }
                }}
            >
                Sumbit
            </button>
        </form>
    );
};

export default App;
