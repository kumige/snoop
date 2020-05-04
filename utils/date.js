const now = () => {
  let now = new Date();
  const dd = now.getDate().toString().padStart(2, "0");
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = now.getFullYear();

  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${now.getHours()}:${now.getMinutes()}`,
  };
};

const sortList = (qList) => {
  qList.sort((a, b) => {
    const dateA = a.DateTime.date;
    const timeA = a.DateTime.time;
    const dateB = b.DateTime.date;
    const timeB = b.DateTime.time;
    switch (true) {
      case dateA < dateB:
        return -1;
      case dateA > dateB:
        return 1;
      case timeA < timeB:
        return -1;
      case timeA > timeB:
        return 1;
      default:
        return 0;
    }
  });

  return qList
}

module.exports = { now, sortList };
