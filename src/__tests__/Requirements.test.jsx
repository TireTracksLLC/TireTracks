import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Inventory from "../Pages/Inventory";
import { supabase } from "../../supabaseClient";

vi.mock("../../supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../Services/auth", () => ({
  signOut: vi.fn(),
}));

vi.mock("../Services/fitment", () => ({
  lookupFitment: vi.fn(),
}));

function createSupabaseQuery(result) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    update: vi.fn(() => query),
    insert: vi.fn(() => Promise.resolve(result)),
    delete: vi.fn(() => query),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  return query;
}

describe("Inventory - Requirement Test Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-123",
          email: "test@example.com",
        },
      },
      error: null,
    });
  });

  it("should add a Michelin tire to database with all details", async () => {
    const fetchQuery = createSupabaseQuery({ data: [], error: null });
    const findExistingQuery = createSupabaseQuery({ data: [], error: null });
    const insertQuery = createSupabaseQuery({ error: null });

    supabase.from
      .mockReturnValueOnce(fetchQuery)
      .mockReturnValueOnce(findExistingQuery)
      .mockReturnValueOnce({
        insert: insertQuery.insert,
      })
      .mockReturnValueOnce(fetchQuery);

    render(<Inventory />);

    fireEvent.click(await screen.findByText("+ Add Tire"));

    await userEvent.type(screen.getByPlaceholderText("Size"), "225/50R17");
    await userEvent.type(screen.getByPlaceholderText("Brand"), "Michelin");
    await userEvent.selectOptions(
      screen.getByDisplayValue("Condition..."),
      "new"
    );

    const quantityInput = screen.getByDisplayValue("1");
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, "1");

    await userEvent.type(screen.getByPlaceholderText("Price"), "125.99");

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(insertQuery.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: "test-user-123",
          size: "225/50R17",
          brand: "michelin",
          model: null,
          condition: "new",
          quantity: 1,
          price: 125.99,
        }),
      ]);
    });
  });

  it("should decrease a tire quantity using the quantity modal", async () => {
    const tire = {
      id: "tire-123",
      size: "225/65R17",
      brand: "michelin",
      model: "defender",
      condition: "new",
      quantity: 2,
      price: 125.99,
      created_at: "2024-01-15",
    };

    const fetchQuery = createSupabaseQuery({ data: [tire], error: null });
    const updateQuery = createSupabaseQuery({ error: null });
    const updateFn = vi.fn(() => updateQuery);

    supabase.from
      .mockReturnValueOnce(fetchQuery)
      .mockReturnValueOnce({
        update: updateFn,
      });

    render(<Inventory />);

    expect(await screen.findByText("Michelin")).toBeInTheDocument();

    fireEvent.click(screen.getByText("-"));

    const amountInput = screen.getByLabelText(/Amount to remove/i);
    await userEvent.type(amountInput, "1");

    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(updateFn).toHaveBeenCalledWith({ quantity: 1 });
      expect(screen.getByText("Quantity updated.")).toBeInTheDocument();
    });
  });

  it("should search for 225/65R17 tires", async () => {
    const allTires = [
      {
        id: "1",
        size: "225/65R17",
        brand: "michelin",
        model: "defender",
        condition: "new",
        quantity: 2,
        price: 125.99,
        created_at: "2024-01-15",
      },
      {
        id: "2",
        size: "225/65R17",
        brand: "goodyear",
        model: "assurance",
        condition: "used",
        quantity: 1,
        price: 85.5,
        created_at: "2024-01-10",
      },
      {
        id: "3",
        size: "205/55R16",
        brand: "bridgestone",
        model: "turanza",
        condition: "new",
        quantity: 3,
        price: 98.75,
        created_at: "2024-01-20",
      },
    ];

    const fetchQuery = createSupabaseQuery({ data: allTires, error: null });
    supabase.from.mockReturnValue(fetchQuery);

    render(<Inventory />);

    expect(await screen.findByText("Michelin")).toBeInTheDocument();
    expect(screen.getByText("Bridgestone")).toBeInTheDocument();

    await userEvent.type(
      screen.getByPlaceholderText("Search by size (ex: 225/65R17)"),
      "225/65R17"
    );

    await waitFor(() => {
      expect(screen.getByText("Michelin")).toBeInTheDocument();
      expect(screen.getByText("Goodyear")).toBeInTheDocument();
      expect(screen.queryByText("Bridgestone")).not.toBeInTheDocument();
    });
  });
});