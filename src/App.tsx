import React, { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { Device } from "@capacitor/device";
import "./App.css";

const App: React.FC = () => {
  const [birthdate, setBirthdate] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [batteryStatus, setBatteryStatus] = useState<string>("");

  // Hàm tính số ngày còn lại đến sinh nhật
  const calculateDaysLeft = () => {
    if (!birthdate) return;

    const today = new Date();
    const [day, month] = birthdate.split("/").map(Number);
    let nextBirthday = new Date(today.getFullYear(), month - 1, day);

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(diffDays);
    showNotification(diffDays);
  };

  // Hiển thị thông báo Local Notifications
  const showNotification = async (days: number) => {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Đếm ngược sinh nhật",
            body: `Còn ${days} ngày nữa đến sinh nhật của bạn! `,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) }, // Thông báo ngay lập tức
          },
        ],
      });
    }
  };

  // Chia sẻ kết quả bằng Share API
  const shareCountdown = async () => {
    if (daysLeft !== null) {
      await Share.share({
        title: "Đếm ngược sinh nhật",
        text: `Còn ${daysLeft} ngày nữa đến sinh nhật của tôi! `,
        dialogTitle: "Chia sẻ kết quả",
      });
    }
  };

  // Lấy trạng thái pin (Bonus)
  const getBatteryStatus = async () => {
    if (Capacitor.isNativePlatform()) {
      const info = await Device.getBatteryInfo();
      setBatteryStatus(`Pin hiện tại: ${info.batteryLevel! * 100}%`);
    }
  };

  return (
    <div className="container">
      <h1> Đếm ngược sinh nhật </h1>
      <input
        type="text"
        placeholder="Nhập ngày sinh (dd/mm)"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
      />
      <button onClick={calculateDaysLeft}>Tính số ngày còn lại</button>
      {daysLeft !== null && (
        <p>Còn {daysLeft} ngày nữa đến sinh nhật của bạn! </p>
      )}
      <button onClick={shareCountdown} disabled={daysLeft === null}>
         Chia sẻ kết quả
      </button>
      <button onClick={getBatteryStatus}> Kiểm tra pin</button>
      {batteryStatus && <p>{batteryStatus}</p>}
    </div>
  );
};

export default App;
