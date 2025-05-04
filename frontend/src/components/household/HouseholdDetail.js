import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getHouseholdById,
  getHouseholdMembers,
  addPersonToHousehold,
  removePersonFromHousehold
} from '../../services/householdService';
import { getAllPeople } from '../../services/personService';
import { getHouseholdHistory } from '../../services/householdHistoryService';

const HouseholdDetail = () => {
  const { id } = useParams();
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [persons, setPersons] = useState([]);
  const [addForm, setAddForm] = useState({ nhanKhauId: '', relationship: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [householdData, memberData, historyData, personList] = await Promise.all([
          getHouseholdById(id),
          getHouseholdMembers(id),
          getHouseholdHistory(id),
          getAllPeople()
        ]);
        setHousehold(householdData);
        setMembers(memberData);
        setHistory(historyData);
        setPersons(personList);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu hộ khẩu.');
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addPersonToHousehold(id, addForm);
      const updatedMembers = await getHouseholdMembers(id);
      setMembers(updatedMembers);
      setAddForm({ nhanKhauId: '', relationship: '', note: '' });
    } catch (err) {
      setError(err.message || 'Không thể thêm nhân khẩu.');
    }
  };

  const handleRemoveMember = async (nhanKhauId) => {
    setError('');
    try {
      await removePersonFromHousehold(id, nhanKhauId);
      const updatedMembers = await getHouseholdMembers(id);
      setMembers(updatedMembers);
    } catch (err) {
      setError(err.message || 'Không thể xóa nhân khẩu.');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!household) return <div>Không tìm thấy hộ khẩu.</div>;

  return (
    <div>
      <h2>Chi tiết Hộ Khẩu</h2>
      <div>
        <strong>Số hộ khẩu:</strong> {household.soHoKhau}<br />
        <strong>Chủ hộ:</strong> {household.ownerName}<br />
        <strong>Địa chỉ:</strong> {household.address}<br />
        <strong>Số thành viên:</strong> {household.numMembers}<br />
        <strong>Số điện thoại:</strong> {household.phoneNumber}<br />
        <strong>Email:</strong> {household.email}<br />
        <strong>Ngày làm hộ khẩu:</strong> {household.ngayLamHoKhau}<br />
        <strong>Hoạt động:</strong> {household.active ? 'Có' : 'Không'}
      </div>
      <h3>Danh sách nhân khẩu</h3>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.hoTen} ({member.quanHeVoiChuHo})
            <button onClick={() => handleRemoveMember(member.id)} style={{ marginLeft: 8 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <h4>Thêm nhân khẩu</h4>
      <form onSubmit={handleAddMember} style={{ marginBottom: 16 }}>
        <select
          value={addForm.nhanKhauId}
          onChange={e => setAddForm({ ...addForm, nhanKhauId: e.target.value })}
          required
        >
          <option value=''>Chọn nhân khẩu</option>
          {persons.filter(p => !members.some(m => m.id === p.id)).map(person => (
            <option key={person.id} value={person.id}>{person.hoTen}</option>
          ))}
        </select>
        <input
          type='text'
          placeholder='Quan hệ với chủ hộ'
          value={addForm.relationship}
          onChange={e => setAddForm({ ...addForm, relationship: e.target.value })}
          required
        />
        <input
          type='text'
          placeholder='Ghi chú (tùy chọn)'
          value={addForm.note}
          onChange={e => setAddForm({ ...addForm, note: e.target.value })}
        />
        <button type='submit'>Thêm</button>
      </form>
      <h3>Lịch sử hộ khẩu</h3>
      <ul>
        {history.map((item, idx) => (
          <li key={idx}>
            [{item.ngayThayDoi}] {item.loaiThayDoi}: {item.moTa}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HouseholdDetail;
