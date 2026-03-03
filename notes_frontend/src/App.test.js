import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app brand", () => {
  render(<App />);
  expect(screen.getByText(/RETRO•NOTES/i)).toBeInTheDocument();
});
