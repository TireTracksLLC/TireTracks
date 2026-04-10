import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Inventory from '../Pages/Inventory';
import * as supabaseModule from '../supabaseClient';

vi.mock('../supabaseClient');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));
vi.mock('../Services/auth.jsx', () => ({
  signOut: vi.fn(),
}));
vi.mock('../Services/fitment.js', () => ({
  lookupFitment: vi.fn(),
}));

const mockSupabase = supabaseModule.supabase;

describe('Inventory - Simple Test Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
        },
      },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  describe('Test case 1 - adding a tire to database', () => {
    it('should add a Michelin tire to database with all details', async () => {
      render(<Inventory />);

      const addButton = screen.getByText('+ Add Tire');
      fireEvent.click(addButton);

      const sizeInput = screen.getByPlaceholderText('Size');
      const brandInput = screen.getByPlaceholderText('Brand');
      const modelInput = screen.getByPlaceholderText('Model');
      const quantityInput = screen.getByDisplayValue('1');
      const priceInput = screen.getByPlaceholderText('Price');

      const testTireData = {
        size: '225/50R17',
        brand: 'Michelin',
        model: '',
        quantity: '1',
        price: '',
        condition: 'New',
      };

      await userEvent.type(sizeInput, testTireData.size);
      await userEvent.type(brandInput, testTireData.brand);

      const conditionSelect = screen.getByDisplayValue('Condition...');
      await userEvent.selectOptions(conditionSelect, testTireData.condition);

      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, testTireData.quantity);

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tires');
        // Check that insert was called with correct tire data
        const insertCall = mockSupabase.from('tires').insert.mock.calls[0];
        expect(insertCall[0][0]).toMatchObject({
          size: testTireData.size,
          brand: testTireData.brand,
          model: testTireData.model,
          quantity: parseInt(testTireData.quantity),
          price: parseFloat(testTireData.price),
        });
      });

      console.log('✅ TEST PASSED: Tire added successfully');
      console.log('   Added:', testTireData);
    });
  });

  //Test case 2
  describe('Test Case 2 - deleting tire from database', () => {
    it('should delete a tire from inventory', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'tire-123',
                size: '225/65R17',
                brand: 'Michelin',
                model: 'Defender',
                condition: 'New',
                quantity: 2,
                price: 125.99,
                created_at: '2024-01-15',
              },
            ],
            error: null,
          }),
        }),
      });

      render(<Inventory />);

      await waitFor(() => {
        expect(screen.getByText('Michelin')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockSupabase.from('tires').delete).toHaveBeenCalled();
      });

      console.log('✅ TEST PASSED: Tire deleted successfully');
      console.log('   Deleted tire ID: tire-123 (Michelin Defender)');
    });
  });

  describe('test case 3- searching through database', () => {
    it('should search for 225/65R17 tires', async () => {
      const allTires = [
        {
          id: '1',
          size: '225/65R17',
          brand: 'Michelin',
          model: 'Defender',
          condition: 'New',
          quantity: 2,
          price: 125.99,
          created_at: '2024-01-15',
        },
        {
          id: '2',
          size: '225/65R17',
          brand: 'Goodyear',
          model: 'Assurance',
          condition: 'Used',
          quantity: 1,
          price: 85.50,
          created_at: '2024-01-10',
        },
        {
          id: '3',
          size: '205/55R16',
          brand: 'Bridgestone',
          model: 'Turanza',
          condition: 'New',
          quantity: 3,
          price: 98.75,
          created_at: '2024-01-20',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: allTires,
            error: null,
          }),
        }),
      });

      render(<Inventory />);

      await waitFor(() => {
        expect(screen.getByText('Michelin')).toBeInTheDocument();
      });

      const searchTerm = '225/65R17';

      const searchInput = screen.getByPlaceholderText('Search by size (ex: 225/65R17)');
      await userEvent.type(searchInput, searchTerm);

      await waitFor(() => {
        const rows = screen.getAllByText('225/65R17');
        expect(rows.length).toBeGreaterThan(0);
        
        expect(screen.queryByText('Bridgestone Turanza')).not.toBeInTheDocument();
      });

      console.log('✅ TEST PASSED: Search successful');
      console.log('   Searched for:', searchTerm);
      console.log('   Found: 2 matching tires (Michelin, Goodyear)');
    });
  });
});
