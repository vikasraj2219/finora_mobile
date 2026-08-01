// Groups a date-sorted transaction list into "Today" / "Yesterday" / formatted
// date sections, per brief §8. Only meaningful when the list is actually
// sorted by date — TransactionsScreen skips grouping when sorted by amount.
const groupByDate = (items) => {
  const groups = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  items.forEach((item) => {
    const d = new Date(item.date);
    d.setHours(0, 0, 0, 0);
    let label;
    if (d.getTime() === today.getTime()) label = 'Today';
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) lastGroup.items.push(item);
    else groups.push({ label, items: [item] });
  });

  return groups;
};

export default groupByDate;
