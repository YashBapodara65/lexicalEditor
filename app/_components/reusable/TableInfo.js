const Table = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

// TableBody Component
const TableBody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell Component
const TableCell = ({ children, isHeader = false, className }) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className}>{children}</CellTag>;
};

// TableHeader Component
const TableHeader = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

export {TableHeader, TableBody, Table, TableCell, TableRow}