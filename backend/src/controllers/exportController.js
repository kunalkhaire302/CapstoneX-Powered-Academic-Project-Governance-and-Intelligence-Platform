const PdfPrinter = require('pdfmake');
const XLSX = require('xlsx');
const { Group, User, Topic, Evaluation, GroupMember } = {};

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
  },
};

const exportGroupsPDF = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: User, as: 'mentor', attributes: ['name'] },
        { model: Topic, as: 'topic', attributes: ['title', 'status'] },
        { model: GroupMember, as: 'members', include: [{ model: User, as: 'student', attributes: ['name', 'email'] }] },
      ],
    });

    const tableBody = [
      [{ text: 'Group', bold: true }, { text: 'Topic', bold: true }, { text: 'Mentor', bold: true }, { text: 'Status', bold: true }, { text: 'Members', bold: true }],
    ];

    groups.forEach(g => {
      tableBody.push([
        g.name,
        g.topic ? g.topic.title : 'N/A',
        g.mentor ? g.mentor.name : 'Unassigned',
        g.status,
        g.members ? g.members.map(m => m.student ? m.student.name : '').join(', ') : '',
      ]);
    });

    const docDefinition = {
      content: [
        { text: 'CapstoneX — Group Report', style: 'header' },
        { text: `Generated: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: '\n' },
        { table: { headerRows: 1, widths: ['*', '*', 'auto', 'auto', '*'], body: tableBody }, layout: 'lightHorizontalLines' },
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#D2232A' },
        subheader: { fontSize: 10, color: '#666666' },
      },
      defaultStyle: { fontSize: 9 },
    };

    // Use a simple approach — send as JSON (client renders PDF)
    res.json({ pdfDefinition: docDefinition, message: 'Use pdfmake on client to render.' });
  } catch (error) { next(error); }
};

const exportGroupsExcel = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: User, as: 'mentor', attributes: ['name'] },
        { model: Topic, as: 'topic', attributes: ['title', 'status'] },
        { model: GroupMember, as: 'members', include: [{ model: User, as: 'student', attributes: ['name', 'email'] }] },
      ],
    });

    const data = groups.map(g => ({
      'Group Name': g.name,
      'Department': g.department || '',
      'Batch Year': g.batch_year || '',
      'Topic': g.topic ? g.topic.title : 'N/A',
      'Topic Status': g.topic ? g.topic.status : 'N/A',
      'Mentor': g.mentor ? g.mentor.name : 'Unassigned',
      'Status': g.status,
      'Members': g.members ? g.members.map(m => m.student ? m.student.name : '').join(', ') : '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Groups');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=capstonex_groups.xlsx');
    res.send(buffer);
  } catch (error) { next(error); }
};

module.exports = { exportGroupsPDF, exportGroupsExcel };
