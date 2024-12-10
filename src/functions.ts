import axios from "axios";

export const convertToPHTime = (
  timestamp: string,
  withYear: boolean = false
) => {
  const utcDate = new Date(timestamp);
  const phTime = new Date(utcDate.getTime());
  const formattedDate = phTime.toLocaleDateString("en-US", {
    month: withYear ? "long" : "2-digit",
    day: "2-digit",
    year: withYear ? "numeric" : undefined,
  });
  const formattedTime = phTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} ${formattedTime}`;
};

export const dueDateify = (time: string) => {
  const currentDate = new Date();
  const dueDate = new Date(time);
  const daysLeft = Math.floor(
    (dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
  );
  if (daysLeft >= -1 && daysLeft <= 1) {
    let due = "";

    if (daysLeft === -1) {
      due = "yesterday";
    } else if (daysLeft === 0) {
      due = "today";
    } else if (daysLeft === 1) {
      due = "tomorrow";
    }

    return (
      due +
      " at " +
      dueDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  } else {
    return convertToPHTime(time, true);
  }
};

interface Data {
  url: string;
  target_url: string;
  title: string;
  favicon: string;
}

export const getLinkData = async (url: string) => {
  const response = await axios.get(
    `https://urlp.asm.skype.com/v1/url/info?url=${url}`,
    {
      headers: {
        Authorization:
          "skype_token eyJhbGciOiJSUzI1NiIsImtpZCI6IjVFODQ4MjE0Qzc3MDczQUU1QzJCREU1Q0NENTQ0ODlEREYyQzRDODQiLCJ4NXQiOiJYb1NDRk1kd2M2NWNLOTVjelZSSW5kOHNUSVEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3MDE2NzIyOTMsImV4cCI6MTcwMTc1ODY5MSwic2t5cGVpZCI6ImxpdmU6LmNpZC41YjVkNTk4NDAxZmJlZDJlIiwic2NwIjo5NTYsImNzaSI6IjE3MDE2NzIyOTEiLCJjaWQiOiI1YjVkNTk4NDAxZmJlZDJlIiwiYWF0IjoxNzAxNjcyMjI3LCJhYWRfYXBwaWQiOm51bGx9.EhQNKI8tw5NnG0TkVUr441h15Ue4BpJa2VX-p7H62FR9R9M18TR8Xwu1gQaMYGhOdoTSFk8hkMaPkzpf-5PMBZLpEeZhuX5ugexETYHxHokpz2tylWlU40rThhx7Nr6FasUm2J_BboidNVmehl2xGrwPR-K9g9HJlSa4jrd1G5Hd0tjZzRWFOCsZxW554qQ0P_TmgsH1Embco27ImgzZ0nFojSt7WWhlfs3VXY4zIJBawaWT2-6opuooFgD9Ktxjdka1l1clxDv8W_uHRkXfFCyBUv-DKcD5o4pDkV3WYdWmn8GAnFpDi74cuNgDpuIlgPADUZFMyUz3GTOg6-ZixA",
      },
    }
  );
  const data = response.data;
  return data as Data;
};

export const getFileData = (url: string) => {
  const filename = url.split("attachments/")[1];

  const data = {
    url: "",
    target_url: "",
    title: filename,
    favicon: "",
  };
  return data as Data;
};
